import type pino from 'pino';

export const levels = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
  'off',
] as const;
export type Level = typeof levels[number];

export default class Logger {
  constructor(readonly impl: pino.Logger) {}

  get level() {
    return this.impl.level;
  }

  set level(newLevel) {
    this.impl.level = newLevel;
  }

  isLevelEnabled(level: Level) {
    return this.impl.isLevelEnabled(level);
  }

  trace(obj: unknown, msg?: string, ...args: unknown[]): void;
  trace(msg: string, ...args: unknown[]): void;
  trace(objOrMsg: string | unknown, ...msgOrArgs: unknown[]): void {
    this.doLog('trace', objOrMsg, msgOrArgs);
  }

  debug(obj: unknown, msg?: string, ...args: unknown[]): void;
  debug(msg: string, ...args: unknown[]): void;
  debug(objOrMsg: string | unknown, ...msgOrArgs: unknown[]): void {
    this.doLog('debug', objOrMsg, msgOrArgs);
  }

  info(obj: unknown, msg?: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  info(objOrMsg: string | unknown, ...msgOrArgs: unknown[]): void {
    this.doLog('info', objOrMsg, msgOrArgs);
  }

  warn(obj: unknown, msg?: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  warn(objOrMsg: string | unknown, ...msgOrArgs: unknown[]): void {
    this.doLog('warn', objOrMsg, msgOrArgs);
  }

  error(obj: unknown, msg?: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
  error(objOrMsg: string | unknown, ...msgOrArgs: unknown[]): void {
    this.doLog('error', objOrMsg, msgOrArgs);
  }

  fatal(obj: unknown, msg?: string, ...args: unknown[]): void;
  fatal(msg: string, ...args: unknown[]): void;
  fatal(objOrMsg: string | unknown, ...msgOrArgs: unknown[]): void {
    this.doLog('fatal', objOrMsg, msgOrArgs);
  }

  private doLog(level: pino.Level, objOrMsg: string | unknown, msgOrArgs: unknown[]): void {
    if (typeof objOrMsg === 'string') {
      // Example: LOG.info('hello, %s account=%s', 'world', account.id)
      this.impl[level](objOrMsg as string, ...msgOrArgs);
    } else {
      // Example: LOG.error({ err }, 'Oops account=%s is %s', account.id, 'broken')
      this.impl[level](objOrMsg, msgOrArgs[0] as string | undefined, ...msgOrArgs.slice(1));
    }
  }
}
