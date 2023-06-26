import { hostname } from 'os';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { Options } from 'amqplib';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import type { MessageConverter } from './converters';
import { MessageConversionError } from './errors';
import Message, { DEFAULT_PROPERTIES } from './message';

const LOG = LoggerFactory.getLogger('plankton.amqp.publisher.rabbitTemplate');

export default class RabbitTemplate<T> {
  private readonly amqpConnectionManager: AmqpConnectionManager;

  private readonly exchange: string;

  private readonly messageConverter: MessageConverter<T>;

  private readonly channel: ChannelWrapper;

  public constructor(
    amqpConnectionManager: AmqpConnectionManager,
    messageConverter: MessageConverter<T>,
    exchange = '',
  ) {
    this.amqpConnectionManager = amqpConnectionManager;
    this.messageConverter = messageConverter;
    this.exchange = exchange;
    this.channel = this.doCreateChannel();
  }

  /**
   * Send the message using the provided exchange, routing key and message without
   * message conversion
   */
  public send(exchange: string, routingKey: string, message: Message): Promise<boolean> {
    LOG.debug(
      { messageProperties: message.messageProperties },
      'Publishing to %s with key %s',
      exchange,
      routingKey,
    );
    return this.channel.publish(exchange, routingKey, message.body, message.messageProperties);
  }

  /**
   * Send the message using the provided routing key and the configured exchange and
   * message converter
   */
  public async convertAndSend(
    routingKey: string,
    messageBody: T,
    messageParameters?: Options.Publish,
  ): Promise<boolean> {
    return this.send(
      this.exchange,
      routingKey,
      await this.doConvert(messageBody, messageParameters),
    );
  }

  private doConvert(messageBody: T, messageParameters?: Options.Publish): Message {
    try {
      return this.messageConverter(messageBody, {
        ...DEFAULT_PROPERTIES,
        ...(messageParameters ?? {}),
      });
    } catch (err: unknown) {
      throw new MessageConversionError(`Failed to convert ${typeof messageBody} to Message`, err);
    }
  }

  private doCreateChannel(): ChannelWrapper {
    const name = `${hostname()} publisher`;
    LOG.info('Creating %s channel', name);
    return this.amqpConnectionManager
      .createChannel({ name })
      .on('connect', () => LOG.info('%s channel connected', name))
      .on('close', () => LOG.info('%s channel closed', name))
      .on('error', (err) => LOG.error({ err }, '%s channel error', name));
  }
}
