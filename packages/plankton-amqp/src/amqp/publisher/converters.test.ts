import { defaultMessageConverter, jsonMessageConverter } from './converters';
import { DEFAULT_PROPERTIES } from './message';

describe('amqp/publisher/converters', () => {
  describe('defaultMessageConverter', () => {
    it('Wraps the unaltered input in a Buffer and uses the default content type', () => {
      const inputMessage = 'hello world';
      const converted = defaultMessageConverter(Buffer.from(inputMessage), DEFAULT_PROPERTIES);
      expect(converted.body).toEqual(expect.any(Buffer));
      expect(converted.body.toString()).toBe('hello world');
      expect(converted.messageProperties).toEqual({
        contentType: 'application/octet-stream',
        contentEncoding: 'UTF-8',
        persistent: true,
      });
    });
  });
  describe('jsonMessageConverter', () => {
    it('JSON encodes the input and uses the json content type', () => {
      const inputMessage = { foo: 'bar', baz: 123 };
      const converted = jsonMessageConverter(inputMessage, DEFAULT_PROPERTIES);
      expect(converted.body).toEqual(expect.any(Buffer));
      expect(converted.body.toString()).toBe('{"foo":"bar","baz":123}');
      expect(converted.messageProperties).toEqual({
        contentType: 'application/json',
        contentEncoding: 'UTF-8',
        persistent: true,
      });
    });
  });
});
