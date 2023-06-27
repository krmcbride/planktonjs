import config from '../config';
import { UnauthorizedError } from '../errors';
import { jwtMiddlewareFactory } from './jwt-middleware-factory';
import {
  expiredAuthJwt,
  invalidAlgAuthJwt,
  validAuthJwt,
} from './jwt-test-tokens';

const verifiers = config.verifierConfig;

describe('support/jwt-middleware-factory', () => {
  it('exports a factory function for creating jwt middleware', () => {
    expect(jwtMiddlewareFactory).toEqual(expect.any(Function));
  });
  describe('jwtMiddlewareFactory', () => {
    it('returns the middleware function', () => {
      const jwtMw = jwtMiddlewareFactory(verifiers);
      expect(jwtMw).toEqual(expect.any(Function));
      expect(jwtMw.length).toBe(3);
    });
  });
  describe('jwtMiddleware', () => {
    it('invokes the next callback without arguments if the request token verification succeeds', (done) => {
      const req = {
        auth: { user_name: 'scolbert@gmail.com' },
        token: validAuthJwt,
      } as any;
      expect.assertions(1);
      jwtMiddlewareFactory(verifiers)(req, {} as any, (err: any) => {
        expect(err).toBeUndefined();
        done();
      });
    });
    it('invokes the next callback with an Error if the request token verification fails', (done) => {
      expect.assertions(4);
      const req = {
        auth: { user_name: 'scolbert@gmail.com' },
        token: invalidAlgAuthJwt,
      } as any;
      jwtMiddlewareFactory(verifiers)(req, {} as any, (err: any) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toBe('invalid algorithm');
        req.token = expiredAuthJwt;
        jwtMiddlewareFactory(verifiers)(req, {} as any, (err2: any) => {
          expect(err2).toBeInstanceOf(UnauthorizedError);
          expect(err2.message).toBe('jwt expired');
          done();
        });
      });
    });
  });
});
