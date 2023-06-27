import type { NextFunction, Request, RequestHandler, Response } from 'express';

// eslint-disable-next-line import/prefer-default-export
export const asyncMiddleware =
  (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
