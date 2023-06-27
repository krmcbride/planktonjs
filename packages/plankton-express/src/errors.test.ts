import {
  BadRequestError,
  ForbiddenError,
  HttpClientError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from './errors';

describe('support/http/errors', () => {
  [
    { Clazz: BadRequestError, name: 'BadRequestError', status: 400, msg: 'Bad Request' },
    { Clazz: UnauthorizedError, name: 'UnauthorizedError', status: 401, msg: 'Unauthorized' },
    { Clazz: ForbiddenError, name: 'ForbiddenError', status: 403, msg: 'Forbidden' },
    { Clazz: NotFoundError, name: 'NotFoundError', status: 404, msg: 'Not Found' },
    {
      Clazz: UnprocessableEntityError,
      name: 'UnprocessableEntityError',
      status: 422,
      msg: 'Unprocessable Entity',
    },
  ].forEach((config) => {
    describe(config.name, () => {
      let err: HttpClientError;
      beforeEach(() => {
        err = new config.Clazz();
      });
      it('extends Error', () => {
        expect(err).toBeInstanceOf(Error);
      });
      it(`has a name of ${config.name}`, () => {
        expect(err.name).toBe(config.name);
      });
      it(`has a statusCode of ${config.status}`, () => {
        expect(err.statusCode).toBe(config.status);
        expect(err.status).toBe(config.status);
      });
      it(`has a default message of "${config.msg}"`, () => {
        expect(err.message).toBe(config.msg);
      });
      it('can be given a custom message', () => {
        expect(new config.Clazz('custom').message).toBe('custom');
      });
    });
  });
});
