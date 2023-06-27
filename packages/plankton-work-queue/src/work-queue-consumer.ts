import { LoggerFactory } from '@krmcbride/plankton-logger';
import type WorkQueue from './work-queue';
import type WorkQueueJobDetails from './work-queue-job-details';

const LOG = LoggerFactory.getLogger('plankton.workQueue.workQueueConsumer');

export default class WorkQueueConsumer<T extends WorkQueueJobDetails> {
  public readonly name: string;

  public isTracingEnabled = false;

  private readonly queue: WorkQueue<T>;

  private readonly worker: (job: T) => unknown;

  public constructor(name: string, queue: WorkQueue<T>, worker: (job: T) => unknown) {
    this.name = name;
    this.queue = queue;
    this.worker = worker;
  }

  public async consume(): Promise<boolean> {
    const dequeuedItem = await this.queue.dequeue();
    if (dequeuedItem === null) {
      return false;
    }
    return this.doWork(dequeuedItem);
  }

  private async doWork(dequeuedItem: { jobId: string; jobDetails: T }): Promise<boolean> {
    const { jobId, jobDetails } = dequeuedItem;
    LOG.debug({ jobId }, 'job-%s: Dequeued', this.name);
    try {
      const processingResult = await this.worker(jobDetails);
      LOG.debug({ jobId, processingResult }, 'job-%s: ACK', this.name);
      await this.queue.ack(jobId, processingResult);
    } catch (err) {
      LOG.warn({ err, jobId }, 'job-%s: NACK', this.name);
      let jobResults = err;
      if (err instanceof Error) {
        jobResults = {
          name: err.name,
          message: err.message,
        };
      }
      await this.queue.nack(jobId, jobResults);
    }
    return true;
  }
}
