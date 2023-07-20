import express, { Express } from 'express';
import { setupApp } from '@krmcbride/plankton-express';
import config from './config';

// eslint-disable-next-line import/prefer-default-export
export const createApp = async (): Promise<Express> => {
  const app = express();
  // Disable etag because they require accurate file timestamps, which isn't the case when deployed
  // artifacts are hashed and have their timestamps zeroed out, as they are in Serverless.
  // See https://github.com/serverless/serverless/pull/3838/files#diff-c7a855de32b8a85d746b686b7b83521caf4eaaa7a869982697e800448486ee0bR93
  app.set('etag', false);
  await setupApp(app, () => {
    app.get('/info', (_req, res) => {
      res.json(config.appInfo);
    });
  });
  return app;
};
