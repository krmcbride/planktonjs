import vm from 'vm';
import type { NextFunction, Request, Response } from 'express';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import { AccessDeniedError } from '../errors';
import AccessExpressionContext from './access-expression-context';

const LOG = LoggerFactory.getLogger('plankton.express.auth.accessMiddlewareFactory');

type Expression = string | ((context: AccessExpressionContext) => boolean);

// eslint-disable-next-line import/prefer-default-export
export const accessMiddlewareFactory =
  (expression: Expression) => (req: Request, _res: Response, next: NextFunction) => {
    const context = new AccessExpressionContext(req);
    let allow = false;
    try {
      if (typeof expression === 'function') {
        allow = expression(context);
      } else {
        allow = vm.runInNewContext(`context.${expression}`, { context });
      }
    } catch (err) {
      LOG.error({ err }, 'AccessExpressionContext evaluation failed');
      return next(new AccessDeniedError(context.getPrincipal(), req.originalUrl));
    }
    if (allow) {
      LOG.debug('%s allowed access to %s', context.getPrincipal(), req.originalUrl);
      return next();
    }
    LOG.debug('%s denied access to %s', context.getPrincipal(), req.originalUrl);
    return next(new AccessDeniedError(context.getPrincipal(), req.originalUrl));
  };
