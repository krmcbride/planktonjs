import http from 'http';

export class BaseError extends Error {
  constructor(msg: string | undefined) {
    super(msg);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export class HttpClientError extends BaseError {
  readonly statusCode: string | number;

  constructor(msg: string | undefined, readonly status: number | string) {
    super(msg || http.STATUS_CODES[status]);
    this.statusCode = status;
  }
}

export class BadRequestError extends HttpClientError {
  constructor(msg?: string) {
    super(msg, 400);
  }
}

export class NotFoundError extends HttpClientError {
  constructor(msg?: string) {
    super(msg, 404);
  }
}

export class UnauthorizedError extends HttpClientError {
  constructor(msg?: string) {
    super(msg, 401);
  }
}

export class ForbiddenError extends HttpClientError {
  constructor(msg?: string) {
    super(msg, 403);
  }
}

export class UnprocessableEntityError extends HttpClientError {
  constructor(msg?: string) {
    super(msg, 422);
  }
}

// eslint-disable-next-line import/prefer-default-export
export class AccessDeniedError extends ForbiddenError {
  constructor(readonly principal: string, readonly resource: string) {
    super(`AccessDeniedError caused by [${principal}] accessing [${resource}]`);
  }
}
