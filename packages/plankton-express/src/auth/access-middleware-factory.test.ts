import { AccessDeniedError } from '../errors';
import { accessMiddlewareFactory } from './access-middleware-factory';

describe('support/access-middleware-factory', () => {
  describe('accessMiddlewareFactory', () => {
    it('returns the middleware function', () => {
      const accessMw = accessMiddlewareFactory('hasRole("FOO")');
      expect(accessMw).toEqual(expect.any(Function));
      expect(accessMw.length).toBe(3);
    });
  });
  describe('accessMiddleware', () => {
    it('invokes the next callback without arguments if the expression allows access for the request', () => {
      const req = {
        auth: { user_name: 'scolbert@gmail.com', authorities: ['ROLE_FOO'] },
        originalUrl: 'http://foo.com/blah',
      } as any;
      const res = {} as any;
      const next = jest.fn();
      accessMiddlewareFactory('hasRole("FOO")')(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0].length).toBe(0); // no args
    });
    it('invokes the next callback with an AccessDeniedError if the expression disallows access for the request', () => {
      const req = {
        auth: { user_name: 'scolbert@gmail.com', authorities: ['ROLE_FOO'] },
        originalUrl: 'http://foo.com/blah',
      } as any;
      const res = {} as any;
      const next = jest.fn();
      accessMiddlewareFactory('hasRole("BAR")')(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0]).toEqual([expect.any(AccessDeniedError)]);
      expect(next.mock.calls[0]).toEqual([expect.any(Error)]);
    });
  });
});
