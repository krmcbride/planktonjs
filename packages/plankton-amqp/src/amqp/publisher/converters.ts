import type { Options } from 'amqplib';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import Message from './message';

const LOG = LoggerFactory.getLogger('plankton.amqp.rabbitTemplate.converters');

export const CONTENT_ENCODING = 'UTF-8';
export const CONTENT_TYPE_BINARY = 'application/octet-stream';
export const CONTENT_TYPE_JSON = 'application/json';

export type MessageConverter<T> = (body: T, properties: Options.Publish) => Message;
export type JsonMessageConverter = MessageConverter<Record<string, unknown>>;

export const defaultMessageConverter: MessageConverter<Buffer> = (body, properties): Message => {
  LOG.debug('Creating Message from buffer');
  return new Message(body, {
    ...properties,
    contentEncoding: CONTENT_ENCODING,
    contentType: CONTENT_TYPE_BINARY,
  });
};

export const jsonMessageConverter: JsonMessageConverter = (obj, properties): Message => {
  LOG.debug('Creating Message from JSON');
  return new Message(Buffer.from(JSON.stringify(obj)), {
    ...properties,
    contentEncoding: CONTENT_ENCODING,
    contentType: CONTENT_TYPE_JSON,
  });
};
