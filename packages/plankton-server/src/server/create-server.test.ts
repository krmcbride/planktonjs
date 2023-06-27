describe('server/create-server', () => {
  describe('createServer', () => {
    test.todo('creates a new express app');
    test.todo('creates a http server from the express app');
    test.todo('applies http-shutdown mods to the server to close connections gracefully on stop');
    test.todo('uses pino request logging middleware');
    test.todo('sets the views property to the value of plankton.view.paths or src/server/views');
    test.todo(
      'use the value of plankton.middleware.static.paths or uses build/public for the static asset path',
    );
    test.todo('plankton.middleware.static.paths can be a comma delimited string');
    test.todo(
      "configures request body and cookie parsers or delegates to the application's parsers module",
    );
    test.todo('installs a /health route if plankton.endpoints.health.enabled');
    test.todo('installs a /info route if plankton.endpoints.info.enabled');
    test.todo('configures a / route which sends a app.html if one exists');
    test.todo('does not configure a / route if no app.html is found');
    test.todo("loads the application's routes module");
    test.todo(
      'passes the express app and an access middleware factory function to the routes module',
    );
    test.todo('default noop access middleware throws if used');
    test.todo('registers 404 middleware last if a view engine is configured');
    test.todo('registers a custom error handler');
    describe('error handler', () => {
      test.todo('responds with json if the request accepts it');
      test.todo('renders a view if the request accepts html and a view engine is configured');
      test.todo(
        'sends status text if the request accepts html and a view engine is not configured',
      );
      test.todo('sends the status text if html view rendering fails');
      test.todo('sends status text if the request does not accept html or json');
      test.todo('alters the response status and body based on error properties');
      test.todo('forwards to the default error handler if headers are sent');
    });
    test.todo('returns a hash including the node server and the express app');
  });
});
