import type { Handler } from 'aws-lambda';
import type { Express } from 'express';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import serverlessExpress from '@vendia/serverless-express';
import config from './config';
import { createApp } from './create-app';

const LOG = LoggerFactory.getLogger('plankton.serverless');

process.once('uncaughtException', (uncaughtException) => {
  // https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
  LOG.fatal({ uncaughtException }, 'Caught `uncaughtException` event, exiting');
  process.exit(1);
});

type AugmentedHandler = Handler & { app: Express };

// eslint-disable-next-line import/prefer-default-export
export const createHandler = async (): Promise<AugmentedHandler> => {
  LOG.info(
    'Plankton v%s initializing %s v%s on nodejs %s',
    config.planktonVersion,
    config.appInfo.name,
    config.appInfo.version,
    process.version,
  );
  const app = await createApp();
  const handler = serverlessExpress({ app });
  const wrappedHandler: AugmentedHandler = async (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
      LOG.debug('Got serverless-plugin-warmup event');
      return undefined;
    }
    LOG.trace({ event, context }, 'Invoking handler');
    return handler(event, context, callback);
  };
  // Included for testing purposes
  wrappedHandler.app = app;
  return wrappedHandler;
};
