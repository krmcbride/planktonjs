import { AmqpConnectionManager, connect } from 'amqp-connection-manager';
import type amqp from 'amqplib';
import { emitter } from '@krmcbride/plankton-emitter';
import { HealthCheckError } from '@krmcbride/plankton-health';
import { LoggerFactory } from '@krmcbride/plankton-logger';

const LOG = LoggerFactory.getLogger('plankton.amqp.connectionFactory');

const DEFAULT_CONFIG: amqp.Options.Connect = {
  username: 'guest',
  password: 'guest',
  hostname: 'localhost',
  port: 5672,
  vhost: '/',
  heartbeat: 60,
};

let amqpConnectionManager: AmqpConnectionManager;

export const amqpConnectionFactory = (config: amqp.Options.Connect): AmqpConnectionManager => {
  if (amqpConnectionManager) {
    return amqpConnectionManager;
  }
  LOG.info('Creating new AmqpConnectionManager');
  amqpConnectionManager = connect({ ...DEFAULT_CONFIG, ...config })
    .on('connect', () => LOG.info('amqpConnectionManager connected'))
    .on('connectFailed', ({ err }) => LOG.info({ err }, 'amqpConnectionManager connectFailed'))
    .on('disconnect', ({ err }) => LOG.info({ err }, 'amqpConnectionManager disconnected'));
  emitter.once('shutdown', (promises) => {
    LOG.info('Closing AmqpConnectionManager');
    promises.push(amqpConnectionManager.close());
  });
  return amqpConnectionManager;
};

export const amqpHealthIndicator = async () => {
  if (amqpConnectionManager && amqpConnectionManager.isConnected()) {
    return { status: 'connected' };
  }
  throw new HealthCheckError('AMQP is not connected', undefined);
};
