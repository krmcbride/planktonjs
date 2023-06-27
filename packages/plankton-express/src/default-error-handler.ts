import type { Application, ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { LoggerFactory } from '@krmcbride/plankton-logger';

const LOG = LoggerFactory.getLogger('plankton.express.defaultErrorHandler');

const isViewEngineConfigured = (app: Application) => !!app.get('view engine');

const renderErrorView = (status: number, req: Request, res: Response) =>
  new Promise((resolve, reject) => {
    const view = `errors/${status}`; // Simple convention
    res.render(view, { req }, (renderError, html) => {
      if (renderError) {
        LOG.warn({ renderError }, 'Failed to render %s view.', view);
        reject(renderError);
        return;
      }
      res.status(status).send(html);
      resolve(undefined);
    });
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logError = (status: number, err: any) => {
  const msg = `Error handler sending ${status} status for error {name=${err.name},message=${err.message}}`;
  if (status >= 500) {
    LOG.error({ err }, msg);
  } else {
    LOG.debug({ err }, msg);
  }
};

// eslint-disable-next-line import/prefer-default-export
export const defaultErrorHandlerFactory =
  (app: Application): ErrorRequestHandler =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (err: any, req: Request, res: Response, next: NextFunction) =>
    new Promise((resolve, reject) => {
      // See http://expressjs.com/en/guide/error-handling.html#the-default-error-handler
      // Delegate to the default handling if headers have already been sent
      if (res.headersSent) {
        reject(err);
        return;
      }
      const status = err.status || err.statusCode || 500;
      logError(status, err);
      switch (req.accepts('html', 'json')) {
        case 'json':
          // Simple default error model
          res.status(status).json({ name: err.name, code: err.code, message: err.message });
          break;
        case 'html':
          if (isViewEngineConfigured(app)) {
            renderErrorView(status, req, res).catch((renderError) => {
              LOG.warn({ renderError }, 'Failed to render error view for');
              res.sendStatus(status);
            });
          } else {
            res.sendStatus(status);
          }
          break;
        default:
          res.sendStatus(status);
      }
      resolve(undefined);
    }).catch(next);
