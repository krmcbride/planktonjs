import type * as net from 'net';
import os from 'os';
import Bluebird from 'bluebird';
import type { Express } from 'express';
import type { StoppableServer } from 'stoppable';
import { emitter } from '@krmcbride/plankton-emitter';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import config from './config';
import { createServer } from './create-server';

const LOG = LoggerFactory.getLogger('plankton.server');

export class PlanktonServer {
  private startupPromise: Promise<PlanktonServer> | null = null;

  private isStarted = false;

  private wrapped: { server: StoppableServer; app: Express } | null = null;

  get app(): Express | undefined {
    return this.wrapped?.app;
  }

  get server(): net.Server | undefined {
    return this.wrapped?.server;
  }

  async start(): Promise<PlanktonServer> {
    if (this.isStarted) {
      LOG.warn('Server is already running');
      return this;
    }
    if (this.startupPromise !== null) {
      LOG.warn('Server is still starting');
      return this.startupPromise;
    }
    this.startupPromise = Bluebird.try(async () => {
      process.once('uncaughtException', (uncaughtException) => {
        // https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
        LOG.fatal({ uncaughtException }, 'Caught `uncaughtException` event, exiting');
        process.exit(1);
      });
      const startTime = Date.now();
      emitter.once('started', () =>
        LOG.info('Application started in: %dms', Date.now() - startTime),
      );
      this.wrapped = await createServer();
      this.wrapped.server.on('error', (serverErrorEvent) => {
        LOG.fatal({ serverErrorEvent }, 'Caught server `error` event, exiting');
        process.exit(1);
      });
      LOG.info(
        'Plankton v%s starting %s v%s on host %s with pid %s',
        config.planktonVersion,
        config.appInfo.name,
        config.appInfo.version,
        os.hostname(),
        process.pid,
      );
      await new Promise((resolve) => {
        this.wrapped?.server.listen(config.serverPort, config.serverIp, () => {
          const address = this.wrapped?.server.address() as net.AddressInfo;
          LOG.info('%s listening on %s:%d', config.appInfo.name, address.address, address.port);
          resolve(undefined);
        });
      });
      this.isStarted = true;
      emitter.emit('started');
      return this;
    }).catch((serverStartupError) => {
      LOG.fatal({ serverStartupError }, 'Caught error on startup, exiting');
      process.exit(1);
    });
    return this.startupPromise;
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      LOG.warn('Server is not running');
      return;
    }
    try {
      await this.startupPromise;
      const shutdownPromises: Promise<unknown>[] = [];
      LOG.info('Emitting shutdown event');
      emitter.emit('shutdown', shutdownPromises);
      LOG.info('Resolving promises before completing shutdown [%s]', shutdownPromises.length);
      await Promise.all(shutdownPromises);
      await new Promise((resolve, reject) => {
        this.wrapped?.server.stop((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(undefined);
        });
      });
    } catch (serverStopError: unknown) {
      LOG.fatal({ serverStopError }, 'Caught error on stop, exiting');
      process.exit(1);
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export const server = new PlanktonServer();
