import { AmqpConnectionManager, ChannelWrapper, connect } from 'amqp-connection-manager';
import { defaultMessageConverter } from './converters';
import { MessageConversionError } from './errors';
import Message from './message';
import RabbitTemplate from './rabbit-template';

jest.mock('amqp-connection-manager');

const channelWrapper = {
  publish: jest.fn<Promise<void>, never>().mockReturnValue(Promise.resolve()),
} as unknown as ChannelWrapper;
channelWrapper.on = jest.fn().mockReturnValue(channelWrapper);
const amqpConnectionManager = {
  createChannel: jest.fn<ChannelWrapper, never>().mockReturnValue(channelWrapper),
} as unknown as AmqpConnectionManager;
const mockedCreateChannel = amqpConnectionManager.createChannel as jest.MockedFunction<
  typeof amqpConnectionManager.createChannel
>;
const mockedPublish = channelWrapper.publish as jest.MockedFunction<typeof channelWrapper.publish>;
const mockedConnect = connect as jest.MockedFunction<typeof connect>;

mockedConnect.mockReturnValue(amqpConnectionManager);

describe('amqp/publisher/rabbitTemplate', () => {
  describe('RabbitTemplate', () => {
    it('exposes a send method', () => {
      const template = new RabbitTemplate(amqpConnectionManager, defaultMessageConverter);
      expect(template.send).toEqual(expect.any(Function));
    });
    it('exposes a convertAndSend method', () => {
      const template = new RabbitTemplate(amqpConnectionManager, defaultMessageConverter);
      expect(template.convertAndSend).toEqual(expect.any(Function));
    });
    describe('send', () => {
      it('expects an exchange, routing key and a message', async () => {
        const template = new RabbitTemplate(amqpConnectionManager, defaultMessageConverter);
        expect.assertions(6);
        const result = await template.send(
          'exchange',
          'routing.key',
          new Message(Buffer.from('the message')),
        );
        expect(result).toBeUndefined();
        expect(mockedCreateChannel.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls[0]).toEqual([
          'exchange',
          'routing.key',
          expect.any(Buffer),
          expect.any(Object),
        ]);
        expect((mockedPublish.mock.calls[0][2] as Buffer).toString()).toBe('the message');
        expect(mockedPublish.mock.calls[0][3]).toEqual({
          persistent: true,
        });
      });
    });
    describe('convertAndSend', () => {
      it('expects a routing key and a message', async () => {
        const template = new RabbitTemplate(amqpConnectionManager, defaultMessageConverter);
        expect.assertions(6);
        const result = await template.convertAndSend('routing.key', Buffer.from('the message'));
        expect(result).toBeUndefined();
        expect(mockedCreateChannel.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls[0]).toEqual([
          '',
          'routing.key',
          expect.any(Buffer),
          expect.any(Object),
        ]);
        expect((mockedPublish.mock.calls[0][2] as Buffer).toString()).toBe('the message');
        expect(mockedPublish.mock.calls[0][3]).toEqual({
          contentType: 'application/octet-stream',
          contentEncoding: 'UTF-8',
          persistent: true,
        });
      });
      it('allows message property overrides', async () => {
        const template = new RabbitTemplate(amqpConnectionManager, defaultMessageConverter);
        expect.assertions(6);
        const result = await template.convertAndSend('routing.key', Buffer.from('the message'), {
          persistent: false,
          expiration: 10000,
        });
        expect(result).toBeUndefined();
        expect(mockedCreateChannel.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls[0]).toEqual([
          '',
          'routing.key',
          expect.any(Buffer),
          expect.any(Object),
        ]);
        expect((mockedPublish.mock.calls[0][2] as Buffer).toString()).toBe('the message');
        expect(mockedPublish.mock.calls[0][3]).toEqual({
          contentType: 'application/octet-stream',
          contentEncoding: 'UTF-8',
          persistent: false,
          expiration: 10000,
        });
      });
      it('uses the configured converter to convert the input message to a Message', async () => {
        const messageConverter = jest
          .fn()
          .mockReturnValue(new Message(Buffer.from('blah'), { appId: 'foo' }));
        const template = new RabbitTemplate(amqpConnectionManager, messageConverter);
        expect.assertions(5);
        const result = await template.convertAndSend('routing.key', 'the message');
        expect(result).toBeUndefined();
        expect(mockedCreateChannel.mock.calls.length).toBe(1);
        expect(messageConverter.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls[0]).toEqual([
          '',
          'routing.key',
          Buffer.from('blah'),
          { appId: 'foo' },
        ]);
      });
      it('throws a MessageConversionError if the converter fails', async () => {
        const messageConverter = jest.fn().mockImplementation(() => {
          throw new Error('oops!');
        });
        const template = new RabbitTemplate(amqpConnectionManager, messageConverter);
        expect.assertions(4);
        await expect(template.convertAndSend('routing.key', 'the message')).rejects.toEqual(
          expect.any(MessageConversionError),
        );
        expect(mockedCreateChannel.mock.calls.length).toBe(1);
        expect(messageConverter.mock.calls.length).toBe(1);
        expect(mockedPublish.mock.calls.length).toBe(0);
      });
    });
  });
});
