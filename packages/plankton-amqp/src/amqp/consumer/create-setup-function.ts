import type { SetupFunc } from 'amqp-connection-manager';
import type { Channel, Options } from 'amqplib';

export const PRIMARY_EXCHANGE_NAME = 'amq.topic';
export const DLX_NAME = 'dead-letter.topic';
export const DEFAULT_EXCHANGE_OPTIONS: Options.AssertExchange = {
  autoDelete: false,
  durable: true,
};
export const DEFAULT_QUEUE_OPTIONS: Options.AssertQueue = {
  autoDelete: false,
  durable: true,
  exclusive: false,
};

export default (serviceName: string, prefetchCount: number): SetupFunc =>
  async (channel: Channel): Promise<void> => {
    const dlqName = `${serviceName}/dead-letter`;
    await channel.prefetch(prefetchCount, false); // per consumer
    await channel.assertExchange(PRIMARY_EXCHANGE_NAME, 'topic', DEFAULT_EXCHANGE_OPTIONS);
    await channel.assertExchange(DLX_NAME, 'topic', DEFAULT_EXCHANGE_OPTIONS);
    await channel.assertQueue(dlqName, DEFAULT_QUEUE_OPTIONS);
    await channel.bindQueue(dlqName, DLX_NAME, `${serviceName}.#`);
  };
