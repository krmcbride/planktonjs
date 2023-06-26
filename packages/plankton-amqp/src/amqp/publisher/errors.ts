class BaseError extends Error {
  protected constructor(msg: string) {
    super(msg);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

// eslint-disable-next-line import/prefer-default-export
export class MessageConversionError extends BaseError {
  public readonly cause: unknown;

  public constructor(msg: string, cause: unknown) {
    super(msg);
    this.cause = cause;
  }
}
