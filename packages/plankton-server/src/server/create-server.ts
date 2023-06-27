import http from 'http';
import express, { Express } from 'express';
import type { StoppableServer } from 'stoppable';
import { setupApp } from '@krmcbride/plankton-express';
import { HealthCheckError, registerHealthIndicator } from '@krmcbride/plankton-health';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import config from './config';
import prometheusRouterFactory from './prometheus-router-factory';
import { configureTerminus } from './terminus';

const LOG = LoggerFactory.getLogger('plankton.server.createServer');

// eslint-disable-next-line import/prefer-default-export
export const createServer = async (): Promise<{ server: StoppableServer; app: Express }> => {
  const app = express();
  const server = configureTerminus(http.createServer(app)) as StoppableServer;
  registerHealthIndicator('http', async () => {
    if (server.listening) {
      return { status: 'listening', address: server.address() };
    }
    throw new HealthCheckError('Express server is not listening', undefined);
  });
  // Register default error handlers to prevent process exit
  server.on('error', (serverErrorEvent) =>
    LOG.error({ serverErrorEvent }, 'Caught server error event'),
  );
  await setupApp(app, () => {
    app.get('/info', (_req, res) => {
      res.json(config.appInfo);
    });
    app.use('/-/prometheus', prometheusRouterFactory());
  });
  return { server, app };
};
