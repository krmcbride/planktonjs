import { asyncMiddleware } from './async-middleware';

describe('asyncMiddleware', () => {
  it('is a function', () => {
    expect(asyncMiddleware).toEqual(expect.any(Function));
  });
  it('accepts a middleware handler function and returns a middleware handler', () => {
    const handler = asyncMiddleware((req, res) => res.send(`hello ${req.query.foo}`));
    expect(handler).toEqual(expect.any(Function));
    expect(handler.length).toBe(3);
  });
  describe('the returned handler', () => {
    it('returns a promise when invoked', () => {
      const handler = asyncMiddleware((req, res) => res.send(`hello ${req.query.foo}`));
      const promise = handler({ query: {} } as any, { send: jest.fn() } as any, jest.fn());
      expect(promise).toEqual(expect.any(Promise));
    });
    it('calls the inner middleware function when invoked', async () => {
      const reqStub = { query: { foo: 'world!' } };
      const resStub = { send: jest.fn() };
      const nextStub = jest.fn();
      const handler = asyncMiddleware((req, res) => res.send(`hello ${req.query.foo}`));
      const promise = handler(reqStub as any, resStub as any, nextStub);
      await expect(promise).resolves.toBeUndefined();
      expect(resStub.send).toHaveBeenCalledTimes(1);
      expect(resStub.send).toHaveBeenCalledWith('hello world!');
      expect(nextStub).not.toHaveBeenCalled();
    });
    it('forwards errors to the next function', async () => {
      const reqStub = { foo: 'world!' };
      const resStub = { send: jest.fn() };
      const nextStub = jest.fn();
      const error = new Error();
      const handler = asyncMiddleware(async () => {
        throw error;
      });
      const promise = handler(reqStub as any, resStub as any, nextStub);
      await expect(promise).resolves.toBeUndefined(); // always resolves
      expect(resStub.send).not.toHaveBeenCalled();
      expect(nextStub).toHaveBeenCalledTimes(1);
      expect(nextStub).toHaveBeenCalledWith(error);
    });
  });
});
