import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError as JwtUnauthorizedError, expressjwt as jwt } from 'express-jwt';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import { UnauthorizedError } from '../errors';
import type { RFC6750AugmentedRequest } from './rfc6750-middleware';

const LOG = LoggerFactory.getLogger('plankton.express.auth.jwtMiddlewareFactory');

// eslint-disable-next-line import/prefer-default-export
export const jwtMiddlewareFactory = (verifier: string): RequestHandler => {
  const jwtMiddleware = jwt({
    getToken: (req: RFC6750AugmentedRequest) => req.token,
    secret: verifier,
    algorithms: ['RS256'],
  });
  return (req: Request, res: Response, next: NextFunction): void => {
    jwtMiddleware(req, res, (err: unknown) => {
      if (!err) {
        LOG.debug('JWT verified');
        next();
        return;
      }
      if ((err as JwtUnauthorizedError).status === 401) {
        LOG.debug(err, 'JWT verification resulted in %s 401', (err as JwtUnauthorizedError).code);
        next(new UnauthorizedError((err as JwtUnauthorizedError).message));
        return;
      }
      LOG.warn(err, 'JWT verification failed with unknown error');
      next(err);
    });
  };
};
