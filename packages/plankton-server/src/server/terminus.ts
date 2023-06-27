import type http from 'http';
import { createTerminus } from '@godaddy/terminus';
import { emitter } from '@krmcbride/plankton-emitter';
import { checkHealth } from '@krmcbride/plankton-health';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import config from './config';

const LOG = LoggerFactory.getLogger('plankton.server.terminus');

// eslint-disable-next-line import/prefer-default-export
export const configureTerminus = (server: http.Server): http.Server =>
  createTerminus(server, {
    healthChecks: {
      '/-/health': () => checkHealth(),
      verbatim: true, // [optional = false] use object returned from /healthcheck verbatim in response,
      __unsafeExposeStackTraces: true, // [optional = false] return stack traces in error response if healthchecks throw errors
    },
    timeout: config.shutdownTimeoutMillis,
    signals: ['SIGINT', 'SIGTERM', 'SIGQUIT'],
    onSignal: () => {
      const shutdownPromises: Promise<unknown>[] = [];
      LOG.info('Emitting shutdown event on signal');
      emitter.emit('shutdown', shutdownPromises);
      LOG.info('Resolving promises before completing shutdown [%s]', shutdownPromises.length);
      return Promise.all(shutdownPromises);
    },
    // called before the HTTP server starts its shutdown
    beforeShutdown: () =>
      new Promise((resolve) => {
        // See https://github.com/kubernetes-retired/contrib/issues/1140#issuecomment-231641402
        setTimeout(resolve, config.shutdownPauseMillis);
      }),
    logger: (msg, err) => {
      LOG.error({ err }, msg);
    },
  });
