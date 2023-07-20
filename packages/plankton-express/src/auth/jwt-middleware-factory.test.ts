import { UnauthorizedError } from '../errors';
import { jwtMiddlewareFactory } from './jwt-middleware-factory';
import { expiredAuthJwt, invalidAlgAuthJwt, validAuthJwt } from './jwt-test-tokens';

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

describe('support/jwt-middleware-factory', () => {
  it('exports a factory function for creating jwt middleware', () => {
    expect(jwtMiddlewareFactory).toEqual(expect.any(Function));
  });
  describe('jwtMiddlewareFactory', () => {
    it('returns the middleware function', () => {
      const jwtMw = jwtMiddlewareFactory(verifier);
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
      jwtMiddlewareFactory(verifier)(req, {} as any, (err: any) => {
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
      jwtMiddlewareFactory(verifier)(req, {} as any, (err: any) => {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toBe('invalid algorithm');
        req.token = expiredAuthJwt;
        jwtMiddlewareFactory(verifier)(req, {} as any, (err2: any) => {
          expect(err2).toBeInstanceOf(UnauthorizedError);
          expect(err2.message).toBe('jwt expired');
          done();
        });
      });
    });
  });
});
