import { LoggerFactory } from '@krmcbride/plankton-logger';
import type ControlLoopContext from './control-loop-context';
import type { PersistentControlLoopContext } from './control-loop-context';

const LOG = LoggerFactory.getLogger('plankton.workQueue.controlLoop');

export enum ControlLoopStatus {
  STOPPED = 'STOPPED',
  RUNNING = 'RUNNING',
}

const DEFAULT_DELAY_MS = 2000;
const DEFAULT_NAME = 'ctl-loop';

export interface ControlLoopOptions {
  /**
   * An optional name for debugging purposes. Useful when there are many control loops running.
   * Defaults to {@link DEFAULT_NAME}.
   */
  name?: string;
  /**
   * The minimum delay in ms between successive worker invocations. Defaults to
   * {@link DEFAULT_DELAY_MS}.
   */
  delayMs?: number;
  /**
   * The minimum delay before the first worker invocation. Defaults to whatever the configured
   * {@link ControlLoopOptions#delayMs} is.
   */
  initialDelayMs?: number;
  /**
   * Whether a to use a 0ms delay regardless of {@link ControlLoopOptions#delayMs} if the worker
   * function returns true.
   */
  zeroDelayEnabled?: boolean;
  /**
   * A function that returns a boolean to indicate if this loop's worker is enabled. The loop runs
   * regardless but the worker invocation is skipped if the the function returns {@code false}.
   * If no function is provided the worker defaults to enabled.
   */
  isEnabledSupplier?: () => boolean;

  /**
   * An optional {@link PersistentControlLoopContext} for worker functions to save and reload
   * state between invocations.
   */
  context?: PersistentControlLoopContext;
}

const DEFAULT_OPTS: ControlLoopOptions = {};

class NoopControlLoopContext implements PersistentControlLoopContext {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  public get(_key: string): string | undefined {
    return undefined;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  public set(_key: string, _value: string): void {
    // noop
  }

  // eslint-disable-next-line class-methods-use-this
  public flush(): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  public refresh(): Promise<void> {
    return Promise.resolve();
  }
}

export default class ControlLoop {
  public readonly delayMs: number;

  public readonly initialDelayMs: number;

  public readonly zeroDelayEnabled: boolean;

  public readonly name: string;

  private currentPromise = Promise.resolve();

  private isStopped = true;

  private initialDelayTimeout: NodeJS.Timeout | undefined;

  private readonly worker: (context: ControlLoopContext) => unknown;

  private readonly isEnabledSupplier: () => boolean;

  private readonly context: PersistentControlLoopContext;

  /**
   * @param worker The function to be called in a loop
   * @param [opts] Loop options. See {@link ControlLoopOptions}.
   */
  public constructor(worker: (context: ControlLoopContext) => unknown, opts?: ControlLoopOptions) {
    const { name, delayMs, initialDelayMs, isEnabledSupplier, zeroDelayEnabled, context } =
      opts || DEFAULT_OPTS;
    this.worker = worker;
    this.isEnabledSupplier = isEnabledSupplier || ((): boolean => true);
    this.delayMs = delayMs || DEFAULT_DELAY_MS;
    this.initialDelayMs = initialDelayMs || this.delayMs; // defaults to whatever delayMs is
    this.zeroDelayEnabled = !!zeroDelayEnabled;
    this.name = name || DEFAULT_NAME;
    this.context = context || new NoopControlLoopContext();
  }

  /**
   * Get the current {@link ControlLoopStatus} of this loop.
   */
  public getStatus(): ControlLoopStatus {
    return this.isStopped ? ControlLoopStatus.STOPPED : ControlLoopStatus.RUNNING;
  }

  /**
   * Start the control loop
   */
  public start(): void {
    LOG.info(
      '%s starting with initialDelayMs=%s,delayMs=%s',
      this.name,
      this.initialDelayMs,
      this.delayMs,
    );
    this.isStopped = false;
    this.initialDelayTimeout = setTimeout(this.doPoll.bind(this), this.initialDelayMs);
  }

  /**
   * Stop the control loop and return a promise for the last active worker.
   */
  public stop(): Promise<void> {
    LOG.info('%s stopping', this.name);
    if (this.initialDelayTimeout) {
      LOG.debug('%s clearing initial delay timeout', this.name);
      clearTimeout(this.initialDelayTimeout);
    }
    this.isStopped = true;
    return this.currentPromise;
  }

  private doPoll(): void {
    if (this.isStopped) {
      return;
    }
    this.currentPromise = Promise.resolve(this.isEnabledSupplier())
      .then((isEnabled): undefined | unknown => {
        if (!isEnabled) {
          LOG.debug('%s is not enabled, skipping worker invocation', this.name);
          return undefined;
        }
        LOG.debug('%s refreshing %s', this.name, this.context.constructor.name);
        return this.context
          .refresh()
          .then(() => {
            LOG.debug('%s invoking worker', this.name);
            return this.worker(this.context);
          })
          .then((workerResult) => {
            LOG.debug('%s flushing %s', this.name, this.context.constructor.name);
            return this.context.flush().then(() => workerResult);
          });
      })
      .then((workerResult?: unknown): void => {
        LOG.debug('%s completed worker invocation', this.name);
        if (this.zeroDelayEnabled && workerResult === true) {
          LOG.debug('%s worker returned true, using 0ms delay', this.name);
          setTimeout(this.doPoll.bind(this), 0);
        } else {
          setTimeout(this.doPoll.bind(this), this.delayMs);
        }
      })
      .catch((err): void => {
        LOG.error(err, '%s caught error during worker invocation', this.name);
        setTimeout(this.doPoll.bind(this), this.delayMs);
      });
  }
}
