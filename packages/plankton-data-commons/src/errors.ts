export class BaseError extends Error {
  public constructor(msg: string, readonly cause?: unknown) {
    super(msg);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export class DataAccessError extends BaseError {}

export class OptimisticLockFailureError extends DataAccessError {}
