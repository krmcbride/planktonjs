import type { RequestHandler } from 'express';
import { AccessDeniedError, UnauthorizedError } from '../errors';
import { accessMiddlewareChainFactory } from './access-middleware-chain-factory';
import { expiredAuthJwt, invalidAlgAuthJwt, validAuthJwt, validAuthJwt2 } from './jwt-test-tokens';

const verifier = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAukJVqlSotgLZMkNvVtva
OomXIO+QvYsc0A6vkDIoaXTmQH8nmUyOjMcAXdar/K7mMEGheMXugcxYeADopSL4
tk5AY/XLJs35G0Ku67DGCLJPAGt8ua6ndVqUXciZ/JmRWxEDVaAljlBlbVu4kKF8
YO5iXLSKIX1o156dV76vv3nWQw1JvDob6raoGgUiqdEKrDoWKlM1clYx3bz7oYnT
djidG6yqOU9MSzkpy7cJ4SSVwMHZDYojovDxsecASecQcLK9nhzSkQhhfiNjafCb
5+T76Fsw8q4kiv3r6G+zP4Zp/u9Es5YIY+6LBzyUYVihsnL9PujL5T/+O5VSqE0i
iN5sI9x66OFEjG7FmuMNZHLtMklf8FWHrnIMo5PDmf0+F0IlmsGnWFv7QFFfTXIF
8TpsFh0aJx7MwLkt1mhOtU8LZoUla4YF+U7iNqt+Pad61snKFIydGZw5trih4Yby
olRxiMl/MFTj8xUjBMjFOGBISa1wpCxbiOBdHfjuV4pJ+iIQw0CAbZ63+SWgDEXf
Yfj6REMTrY5mbOHHV6cNp6nQ+LVll9+DXp9HIcRL885UmLabXRcODSJkFZGwbH4P
RrkaTpQRqxqD+jkpxrPZ2vaejyqkQ2wUheHP/fKw4KjD6Yds3v9OMm5KYB5WK+NG
JTdD8XgAZhtPgpn79UChzlcCAwEAAQ==
-----END PUBLIC KEY-----`;

describe('server/access-middleware-chain-factory', () => {
  describe('accessMiddlewareChainFactory', () => {
    it('creates access middleware when given a security expression', () => {
      const access = accessMiddlewareChainFactory(verifier);
      const accessMiddleware = access('isAuthenticated');
      expect(accessMiddleware).toEqual(expect.any(Function));
    });
  });
  describe('accessMiddlewareChain', () => {
    let accessChain: (expression: string) => RequestHandler;
    beforeEach(() => {
      accessChain = accessMiddlewareChainFactory(verifier);
    });
    it('raises UnauthorizedError when there is no authorization header', (done) => {
      const req = { header: jest.fn() } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(req.token).toBeUndefined();
        expect(req.auth).toBeUndefined();
        done();
      });
    });
    it('raises UnauthorizedError when the token format is invalid', (done) => {
      const req = {
        header: jest
          .fn()
          .mockImplementation((header) => (header === 'authorization' ? 'foo' : undefined)),
      } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(req.token).toBeUndefined();
        expect(req.auth).toBeUndefined();
        done();
      });
    });
    it('raises UnauthorizedError when the token scheme is invalid', (done) => {
      const req = {
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? 'Basic abc123==' : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(req.token).toBeUndefined();
        expect(req.auth).toBeUndefined();
        done();
      });
    });
    it('raises UnauthorizedError when the token JWT is malformed', (done) => {
      const req = {
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? 'Bearer abc123==' : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(req.token).toBe('abc123==');
        expect(req.auth).toBeUndefined();
        done();
      });
    });
    it('raises UnauthorizedError when the token alg is not permitted', (done) => {
      const req = {
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer ${invalidAlgAuthJwt}` : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(req.token).toBe(invalidAlgAuthJwt);
        expect(req.auth).toBeUndefined();
        done();
      });
    });
    it('raises UnauthorizedError when the token is expired', (done) => {
      const req = {
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer ${expiredAuthJwt}` : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(req.token).toBe(expiredAuthJwt);
        expect(req.auth).toBeUndefined();
        done();
      });
    });
    it('raises no errors when the token is valid', (done) => {
      const req = {
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer ${validAuthJwt}` : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('isAuthenticated()')(req, res, (err: unknown) => {
        expect(err).toBeUndefined();
        expect(req.token).toBe(validAuthJwt);
        expect(req.auth).toEqual({ name: 'Joe Smith' });
        done();
      });
    });
    it('denies access when the expression is invalid', (done) => {
      const req = {
        originalUrl: '/foo',
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer ${validAuthJwt2}` : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('foo')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(AccessDeniedError);
        expect(req.token).toBe(validAuthJwt2);
        expect(req.auth).toEqual({
          user_name: 'test1@gmail.com',
          scope: ['account'],
          authorities: ['ROLE_ADMIN', 'ROLE_CALL', 'ROLE_USER'],
          jti: '9d8e89a6-8150-479a-af13-73d6a758a020',
          client_id: 'auth',
        });
        done();
      });
    });
    it('denies access when the expression is not a context method invocation', (done) => {
      const req = {
        originalUrl: '/foo',
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer ${validAuthJwt2}` : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('true')(req, res, (err: unknown) => {
        expect(err).toBeInstanceOf(AccessDeniedError);
        expect(req.token).toBe(validAuthJwt2);
        expect(req.auth).toEqual({
          user_name: 'test1@gmail.com',
          scope: ['account'],
          authorities: ['ROLE_ADMIN', 'ROLE_CALL', 'ROLE_USER'],
          jti: '9d8e89a6-8150-479a-af13-73d6a758a020',
          client_id: 'auth',
        });
        done();
      });
    });
    it('allows full regex expressions', (done) => {
      const req = {
        originalUrl: '/foo',
        header: jest
          .fn()
          .mockImplementation((header) =>
            header === 'authorization' ? `Bearer ${validAuthJwt2}` : undefined,
          ),
      } as any;
      const res = {} as any;
      accessChain('hasAnyScopeMatching(/blah/, /count$/)')(req, res, (err: unknown) => {
        expect(err).toBeUndefined();
        expect(req.token).toBe(validAuthJwt2);
        expect(req.auth).toEqual({
          user_name: 'test1@gmail.com',
          scope: ['account'],
          authorities: ['ROLE_ADMIN', 'ROLE_CALL', 'ROLE_USER'],
          jti: '9d8e89a6-8150-479a-af13-73d6a758a020',
          client_id: 'auth',
        });
        done();
      });
    });
  });
});
