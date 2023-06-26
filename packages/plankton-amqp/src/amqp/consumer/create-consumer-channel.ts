import { hostname } from 'os';
import type { AmqpConnectionManager, SetupFunc } from 'amqp-connection-manager';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import createSetupFunction from './create-setup-function';

const LOG = LoggerFactory.getLogger('plankton.amqp.consumer.createConsumerChannel');

const DEFAULT_PREFETCH_COUNT = 250;

export default async (
  serviceName: string,
  amqpConnectionManager: AmqpConnectionManager,
  prefetchCount?: number,
): Promise<(setup: SetupFunc) => Promise<void>> => {
  const name = `${hostname()} consumer`;
  const consumerPrefetch = prefetchCount ?? DEFAULT_PREFETCH_COUNT;
  LOG.info('Creating %s channel [prefetch=%s]', name, consumerPrefetch);
  const channelWrapper = await amqpConnectionManager
    .createChannel({
      name,
      setup: createSetupFunction(serviceName, consumerPrefetch),
    })
    .on('connect', () => LOG.info('%s channel connected', name))
    .on('close', () => LOG.info('%s channel closed', name))
    .on('error', (err) => LOG.error({ err }, '%s channel error', name));
  return (setup: SetupFunc) => channelWrapper.addSetup(setup);
};
