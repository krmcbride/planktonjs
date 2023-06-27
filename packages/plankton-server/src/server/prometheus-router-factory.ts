import express, { Request, Response } from 'express';
import { register } from 'prom-client';
import { asyncMiddleware } from '@krmcbride/plankton-express';

export default () => {
  const router = express.Router();
  router.get(
    '/',
    asyncMiddleware(async (_req: Request, res: Response) => {
      res.set('Content-Type', register.contentType).end(await register.metrics());
    }),
  );
  return router;
};
