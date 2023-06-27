import { BadRequestError, UnauthorizedError } from '../errors';
import { rfc6750Middleware } from './rfc6750-middleware';

describe('support/rfc6750-middleware', () => {
  describe('rfc6750Middleware', () => {
    it('accepts an access_token query param, copying it to req.token', () => {
      const req = { query: { access_token: 'the-token' }, body: {}, header: jest.fn() } as any;
      const next = jest.fn();
      rfc6750Middleware(req, {} as any, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0].length).toBe(0); // no args
      expect(req.token).toBe('the-token');
    });
    it('accepts an access_token param in the body, copying it to req.token', () => {
      const req = { query: {}, body: { access_token: 'the-token' }, header: jest.fn() } as any;
      const next = jest.fn();
      rfc6750Middleware(req, {} as any, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0].length).toBe(0); // no args
      expect(req.token).toBe('the-token');
    });
    it('accepts a Bearer token in the Authorization header, copying it to req.token', () => {
      const req = {
        query: {},
        body: {},
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? 'Bearer the-token' : undefined,
          ),
      } as any;
      const next = jest.fn();
      rfc6750Middleware(req, {} as any, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0].length).toBe(0); // no args
      expect(req.token).toBe('the-token');
    });
    it('Bearer token handling splits on whitespace', () => {
      const req = {
        query: {},
        body: {},
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer     \t   the-token` : undefined,
          ),
      } as any;
      const next = jest.fn();
      rfc6750Middleware(req, {} as any, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0].length).toBe(0); // no args
      expect(req.token).toBe('the-token');
    });
    it('The next callback is invoked with an error if a token is provided in more than one location', () => {
      const req = {
        query: {},
        body: { access_token: 'the-token' },
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? 'Bearer the-token' : undefined,
          ),
      } as any;
      const next = jest.fn();
      rfc6750Middleware(req, {} as any, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0]).toEqual([expect.any(BadRequestError)]);
      expect(req.token).toBeUndefined();
    });
    it('The next callback is invoked with an error if the Authorization header is set but without a proper Bearer token', () => {
      const req = {
        query: {},
        body: {},
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? 'Bearer the-token abc' : undefined,
          ),
      } as any;
      const next = jest.fn();
      rfc6750Middleware(req as any, {} as any, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0]).toEqual([expect.any(UnauthorizedError)]);
      expect(req.token).toBeUndefined();
    });
  });
});
