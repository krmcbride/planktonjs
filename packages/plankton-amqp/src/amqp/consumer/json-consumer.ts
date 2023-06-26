import type { Channel, ConsumeMessage } from 'amqplib';
import { LoggerFactory } from '@krmcbride/plankton-logger';

const LOG = LoggerFactory.getLogger('plankton.amqp.consumers.jsonConsumer');

export default <T>(
    channel: Channel,
    consumer: (payload: T, message: ConsumeMessage) => void | Promise<void>,
  ): ((message: ConsumeMessage | null) => void) =>
  (message: ConsumeMessage | null): void => {
    if (message === null) {
      LOG.warn('Dropping null message');
    } else {
      const jsonStr = message.content.toString(message.properties.contentEncoding ?? 'utf8');
      LOG.debug({ jsonStr }, 'Consumed [%s]', message.fields.routingKey);
      Promise.resolve(consumer(JSON.parse(jsonStr) as T, message))
        .then(() => {
          channel.ack(message);
        })
        .catch((err: unknown) => {
          LOG.error(
            { err },
            'Failure consuming Message{fields=%s,properties=%s}, caught',
            JSON.stringify(message?.fields),
            JSON.stringify(message?.properties),
          );
          channel.reject(message, false);
        });
    }
  };
