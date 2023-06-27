import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors';

export type RFC6750AugmentedRequest = Request & {
  token?: string;
};

/**
 * Searches the request for an OAuth2 Bearer token and sets it on
 * `req.token` following RFC6750 guidelines
 *
 * @see https://tools.ietf.org/html/rfc6750
 * @see https://tools.ietf.org/html/rfc6750#section-2.1
 * @see https://tools.ietf.org/html/rfc6750#section-2.2
 * @see https://tools.ietf.org/html/rfc6750#section-2.3
 * @see https://tools.ietf.org/html/rfc6750#section-3.1
 */
// eslint-disable-next-line import/prefer-default-export
export const rfc6750Middleware = (
  req: RFC6750AugmentedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const tokens = [];
  if (req.query && req.query.access_token) {
    tokens.push(req.query.access_token);
  }
  if (req.body && req.body.access_token) {
    tokens.push(req.body.access_token);
  }
  if (req.header('authorization')) {
    const parts = (req.header('authorization') || '').split(/\s+/);
    if (parts.length !== 2) {
      return next(
        new UnauthorizedError('Bad authorization format - format is Authorization: Bearer [token]'),
      );
    }
    const [scheme, token] = parts;
    if (scheme !== 'Bearer') {
      return next(
        new UnauthorizedError('Bad authorization scheme - format is Authorization: Bearer [token]'),
      );
    }
    tokens.push(token);
  }
  // RFC6750 states the access_token MUST NOT be provided
  // in more than one place in a single request.
  if (tokens.length > 1) {
    return next(new BadRequestError('Multiple bearer tokens must not be provided'));
  }
  if (tokens.length === 1) {
    req.token = tokens[0]; // eslint-disable-line prefer-destructuring
  }
  return next();
};
