describe('server/plankton-server', () => {
  describe('PlanktonServer', () => {
    describe('start', () => {
      test.todo(
        'takes an optional config argument and returns a promise that is fulfilled with the server instance',
      );
      test.todo('emits a started event');
      test.todo('creates components');
      test.todo('creates the http server and express app');
      test.todo('traps signals with the death module');
      test.todo('the server instance exposes the express app');
    });
    describe('stop', () => {
      test.todo('returns a promise');
      test.todo('rejects its promise if the server is not running');
      test.todo('shuts down the http server');
      test.todo('emits the shutdown event');
    });
  });
});
