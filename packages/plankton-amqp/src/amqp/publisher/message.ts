import type { Options } from 'amqplib';

export const DEFAULT_PROPERTIES: Options.Publish = {
  persistent: true,
};

export default class Message {
  public readonly body: Buffer;

  public readonly messageProperties: Options.Publish;

  constructor(body?: Buffer, properties?: Options.Publish) {
    this.body = body ?? Buffer.alloc(0);
    this.messageProperties = properties ?? DEFAULT_PROPERTIES;
  }
}
