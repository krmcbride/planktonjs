import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import type { Application, NextFunction, Request, Response } from 'express';
import pino from 'express-pino-logger';
import { registerHealthIndicator } from '@krmcbride/plankton-health';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import { accessMiddlewareChainFactory } from './auth/access-middleware-chain-factory';
import type { ComponentsCallbackArgs, ParsersCallbackArgs, RoutesCallbackArgs } from './callbacks';
import config from './config';
import { defaultErrorHandlerFactory } from './default-error-handler';
import { NotFoundError } from './errors';
import { useStatic } from './static-middleware';
import { tryApplicationModule } from './utils';

// eslint-disable-next-line import/prefer-default-export
export const setupApp = async (
  app: Application,
  frameworkRoutesCb: (app: Application) => unknown,
): Promise<void> => {
  await (
    await tryApplicationModule<ComponentsCallbackArgs>('components', async () => {})
  )({ registerHealthIndicator });
  // Request logging
  app.use(
    pino({
      logger: LoggerFactory.getLogger('plankton.express.request').impl,
      useLevel: 'trace',
    }),
  );
  // Static asset middleware
  useStatic(app);
  // Swappable request parsing middleware
  await (
    await tryApplicationModule<ParsersCallbackArgs>('parsers', async () => {
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json({ type: ['json', '+json'] }));
      app.use(cookieParser());
    })
  )({ app });
  // Framework routes
  await frameworkRoutesCb(app);
  // Application routes
  await (
    await tryApplicationModule<RoutesCallbackArgs>('routes', async () => {})
  )({
    app,
    access: config.verifier
      ? accessMiddlewareChainFactory(config.verifier)
      : () => {
          throw new Error('No JWT verifier is configured');
        },
  });
  // Register a 404 catch-all last
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError());
  });
  // Default error handler -- promise just for testing
  app.use(defaultErrorHandlerFactory(app));
};
