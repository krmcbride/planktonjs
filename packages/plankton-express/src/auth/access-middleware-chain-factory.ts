import ConnectSequence from 'connect-sequence';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { accessMiddlewareFactory } from './access-middleware-factory';
import { jwtMiddlewareFactory } from './jwt-middleware-factory';
import { rfc6750Middleware } from './rfc6750-middleware';

// eslint-disable-next-line import/prefer-default-export
export const accessMiddlewareChainFactory = (
  verifier: string,
): ((expression: string) => RequestHandler) => {
  const jwtMiddleware = jwtMiddlewareFactory(verifier);
  return (expression: string): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
      const seq = new ConnectSequence(req, res, next);
      seq
        .append(rfc6750Middleware)
        .append(jwtMiddleware)
        .append(accessMiddlewareFactory(expression))
        .run();
    };
};
