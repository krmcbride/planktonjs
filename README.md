# plankton

Plankton, originally inspired by [Spring Boot](https://spring.io/projects/spring-boot/) and [Spring Cloud](https://spring.io/projects/spring-cloud/), was born to provide nodejs microservice boilerplate. Plankton's closest analogue would likely be [Nest](https://nestjs.com/), from which it borrows some patterns, such as for [`terminus`](https://www.npmjs.com/package/@godaddy/terminus) health checks and [`dotenv`](https://www.npmjs.com/package/dotenv) configuration.

Plankton's feature set includes:

- Batteries-included-but-replaceable approach to configuring [Express](https://expressjs.com/).
- Support for running workloads in either ["server"](https://kubernetes.io/) or ["serverless"](https://www.serverless.com/) deployments.
- Health check middleware that can be extended with custom indicators and which works in either "server" or "serverless" mode.
- A `TypedEventEmitter` singleton for application lifecycle events.
- A simple `LoggingFactory` and `Logger` abstraction inspired by [SLF4J](https://github.com/qos-ch/slf4j).
- Utilities for safely pulling configuration in from environment variables.
- JWT verification and claim authorization middleware.
- An async middleware wrapper function to forward rejected promises to the Express `NextFunction`, at least until [Express 5 arrives](https://expressjs.com/en/guide/migrating-5.html#rejected-promises).
- Prometheus endpoint for metrics scraping when deployed in "server" mode.

## Quick Start

Most projects will need to install `@krmcbride/plankton`, and one of `@krmcbride/plankton-serverless` or `@krmcbride/plankton-server`.

### Serverless deployment

To boot your service in "serverless" mode (to be invoked by Lambda using Serverless Framework) create a `boot/src/index.ts` file with the following:

```typescript
export { api, preflight } from '@krmcbride/plankton-serverless/dist/src/boot';
```

The `functions` snippet of `serverless.yml` would look like the following, assuming `serverless-plugin-canary-deployments` is used with the preflight check:

```yaml
functions:
  api:
    handler: boot/dist/src.api
    events:
      - http:
          method: any
          path: /${self:service}/{proxy+}
          cors: true
      - http:
          method: any
          path: /${self:service}/
          cors: true
    deploymentSettings:
      type: ${self:custom.${self:custom.stage}.deploymentType}
      alias: live
      preTrafficHook: preflight
  preflight:
    handler: boot/dist/src.preflight
```

### Server deployment

To boot your service in "server" mode (to run in a Kubernetes pod for instance) create a `boot/src/index.ts` file with the following:

```typescript
import '@krmcbride/plankton-serverless/dist/src/boot';
```

The server entrypoint after compilation would be `boot/dist/src`.

## Application project structure

The recommended monorepo project structure is:

```
amqp/  <------------------ Optional AMQP I/O adapters
  src/
api/  <------------------- The service's API, consisting of Express routers
  src/
    routes/
app/  <----------------- Optional Vue app
  src/
boot/  <---------------- The boot module prepares the service at runtime, with plankton's help
  src/
    __tests__/  <------- Integration tests, which should use an .itest.ts suffix
    components/  <------ Runtime initialization, dependency injection, event registration, etc.
      index.ts  <------- Loaded by plankton on boot
    config/
      local.env  <------ Optional local gitignored environment variable overrides
      local.sample.env
      index.ts  <------- All runtime configuration pulled in using plankton-environment
    routes/
      index.ts  <------- Loaded by plankton, registers routers from the api module
    index.ts  <--------- Service entrypoint, uses plankton's boot script (see previous section)
    parsers.ts  <------- Optional, loaded by plankton on boot to modify body parsing
core/  <---------------- The core domain/model, i.e. the reason this service exists at all
  src/
data/  <---------------- Optional persistence I/O adapters
  src/
    aws-s3/  <---------- AWS S3 DTOs and DAOs
    mongodb/ <---------- MongoDB DTOs and DAOs
    redis/  <----------- Redis DTOs and DAOs
web/  <----------------- Optional web I/O adapters
  src/
    client/  <---------- Web clients (REST, GraphQL, etc)
```

Note that `boot/src/index.ts` is required but the `components`, `parsers`, and `routes` modules are optional (although having no routes or components won't make much of a service). The `boot/src/config/local.env` file is also optional and should be placed on the project's `.gitignore`.

## Boot sequence hooks

On boot plankton will attempt to load several optional modules from the project's `boot/src` directory:

### `boot/src/components`

- Should export an async function accepting `ComponentsCallbackArgs`.
  - The `components` callback is responsible for performing all runtime preparation before the app starts receiving requests. These responsibilities may include:
    - Dependency injection and creation of services defined in `boot/src/components/`
    - Registration of plankton `startup` or `shutdown` listeners
    - Registration of AMQP consumers
    - Initialization of database connections
    - Registration of health checks

The following is a `boot/src/components/index.ts` implementation example:

```typescript
import { ComponentsCallbackArgs, emitter } from '@krmcbride/plankton';
import { leaderControlLoop } from 'plankton-work-queue';
import config from '../config';
import { amqpHealthIndicator } from './amqp-connection-manager';
import { configureConsumers } from './amqp-consumers';
import { mongoClientFactory, mongoHealthIndicator } from './mongo-client-factory';
import { redisHealthIndicator } from './redis-client-factory';
import { fooControlLoop } from './tasks';

export default async ({ registerHealthIndicator }: ComponentsCallbackArgs) => {
  registerHealthIndicator('amqp', amqpHealthIndicator);
  registerHealthIndicator('mongodb', mongoHealthIndicator);
  registerHealthIndicator('redis', redisHealthIndicator);
  await mongoClientFactory(); // eagerly connect
  if (config.amqp.consumers.enabled) {
    await configureConsumers();
  }
  if (config.tasks.enabled) {
    emitter.once('started', () => {
      leaderControlLoop.start();
      fooControlLoop.start();
    });
    emitter.once('shutdown', (shutdownPromises) => {
      shutdownPromises.push(fooControlLoop.stop());
      shutdownPromises.push(leaderControlLoop.stop());
    });
  }
};
```

Health checks registered with the `registerHealthIndicator` function provide a check name and a `HealthIndicator`, which is simply an async function:

```typescript
export const redisHealthIndicator = async () => {
  if (redisClient.connected) {
    return { status: 'connected' };
  }
  throw new HealthCheckError('Redis is not connected', undefined);
};
```

### `boot/src/parsers`

- Should export an async function accepting `ParsersCallbackArgs`.
- This callback may be used to modify `bodyParser` and `cookieParser` config, etc.

If plankton's defaults were copied into a `boot/src/parsers.ts` it would look like:

```typescript
import { ParsersCallbackArgs } from '@krmcbride/plankton';

export default async ({ app }: ParsersCallbackArgs) => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ type: ['json', '+json'] }));
  app.use(cookieParser());
};
```

### `src/boot/routes`

- Should export an async function accepting `RoutesCallbackArgs`.
- This is where components from `src/boot/components` should be injected into router factories and registered with express.

The following is a `src/boot/routes/index.ts` implementation example:

```typescript
import { RoutesCallbackArgs } from '@krmcbride/plankton';
import fooRouterFactory from '../../web/api/foo-router-factory';
import barRouterFactory from '../../web/api/bar-router-factory';
import barDependency from '../components/bar-dependency';
import errorHandler from './support/error-handler';

export default async ({ app, access }: RoutesCallbackArgs) => {
  app.use('/foo', fooRouterFactory());
  // All subsequent paths require an authenticated user
  app.use(access('isAuthenticated()'));
  app.use('/bar', barRouterFactory(barDependency));
  app.use(errorHandler);
};
```

## Environment

> See `packages/plankton-server/src/server/config.ts` or `packages/plankton-serverless/src/serverless/config.ts` for plankton's default configurations.

All configuration should be provided via environment variables. In non-production settings plankton will use [`dotenv`](https://github.com/motdotla/dotenv) to load the project's `src/boot/config/local.env` file if it exists, which should be used to set local development environment variables.

Plankton exports an `environment` module with `getProperty` and `getPropertyAsBoolean` functions to assist with setting configuration from the environment.

The following is a sample `src/boot/config/index.ts` which it uses to centralize all configuration, using plankton's `environment` utils to ensure all required configuration is set on startup. For readability you may use `dot.delimited.camelCase` property keys with `getProperty` and `getPropertyAsBoolean`. All keys are normalized to `UPPER_SNAKE_CASE` with dots becoming underscores.

> Reminder: all environment variables start out as strings. Plankton's `getPropertyAsBoolean` implements a truthiness internal function that interprets `"false"`, `"off"`, `"no"`, `"nope"`, and `"0"` as `false`, while any other value is `true`. This means an empty string is `true`, i.e. `getPropertyAsBoolean('FOO_ENABLED')` is true when `FOO_ENABLED=`.

```typescript
import { environment } from '@krmcbride/plankton';

const { getProperty, getPropertyAsBoolean } = environment;

export default {
  amqp: {
    consumers: {
      enabled: getPropertyAsBoolean('amqp.consumers.enabled', true),
    },
  },
  foo: {
    bar: Number(getProperty('foo.bar', '6')),
  },
  mongodb: {
    uri: getProperty('mongodb.uri'),
  },
  redis: {
    url: getProperty('redis.uri', 'redis://redis:6379'),
  },
  tasks: {
    version: 'v1',
    enabled: getPropertyAsBoolean('tasks.enabled', true),
  },
};
```

### Encrypted properties

In some deployments, namely serverless lambda deployments, the recommended approach to handling secrets is through encrypted environment variables (called "encryption in transit" in the AWS literature). Plankton's `environment` module provides a `getPropertyAsSecret` method to assist in these cases. Unlike the other property methods which synchronously return a static value, decrypting encrypted environment variables requires a call out to [KMS](https://aws.amazon.com/kms/) which would have the domino effect of causing the configuration verification step in the application bootstrap to be asynchronous, which increases complexity, ruining the benefits of relying on static environment variables.

To mitigate this, `getPropertyAsSecret` synchronously returns a `Secret`, which is a wrapper object with a lone `decrypt` function that returns a `Promise<string>`. This allows synchronous verification that an environment variable is set, and lazy decryption during later application initialization.

A simple `src/boot/config/index.ts` example:

```typescript
import { environment } from '@krmcbride/plankton';

export default {
  mongodb: {
    uri: environment.getPropertyAsSecret('mongodb.uri'),
  },
};
```

In `src/boot/components/mongo-client-factory.ts` using the secret looks like:

```typescript
import { mongoClientFactory } from '@krmcbride/plankton-data-mongodb';
import config from '../config';

export const mongoClientPromise = (async () =>
  mongoClientFactory({ uri: await config.mongodb.uri.decrypt() }))();
```

Since Plankton's `components` loading stage is asynchronous (and so is connecting to MongoDB), waiting for decryption here does not require any sync/async changes, but still happens early enough that a health check can quickly determine if the decrypted value is actually correct.

There are two scenarios where having to make a call to KMS to do decryption is unnecessarily complex and a regular static environment variable would be sufficient: local development and tests. To support this, `getPropertyAsSecret` will operate in "passthrough" mode when either the `IS_OFFLINE` environment variable is set (as is done by the `serverless-offline` plugin) or when the `NODE_ENV` is `test`. In "passthrough" mode, the raw value of the environment variable is passed through without alteration, and without invoking KMS. This allows regular static environment variables to be set in a project's `local.env` and `test.env`.

#### How To Encrypt Things:

Encryption Prerequisites:

- You must have `kms:Encrypt` access to the same KMS key that the service has `kms:Decrypt` access to (because...that's how it works).
- You must have said KMS key's ID.

Suppose you want to encrypt a super secret password like "password":

1. `base64` it

```bash
 > echo -n password | base64
 cGFzc3dvcmQ=
```

2. Say you have an AWS profile called `foo` that can access the an AWS account's lambda KMS key (the key lambda functions are configured to `kms:Decrypt` with). Using the KMS key's ID, to encrypt:

```bash
> AWS_PROFILE=foo \
      aws kms encrypt --region us-west-2 \
      --key-id bc377a31-958d-4fb6-b630-a00ae1cac09f \
      --plaintext cGFzc3dvcmQ=
{
  "CiphertextBlob": "AQICAHggUGvMDbVvkjGlGb0fFwJYVKY3AT3C4ilvrGp5ZbAfNAET1xmXAfvcmdDzcv0NquHvAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMfrJON686quzOgpWtAgEQgCPNfk4c9g2MtmFi/RCvxKCsVL3HDOedXyG7fKLW6MbRTUKWmQ==",
  "KeyId": "arn:aws:kms:us-west-2:1234567890:key/bc377a31-958d-4fb6-b630-a00ae1cac09f",
  "EncryptionAlgorithm": "SYMMETRIC_DEFAULT"
}
```

3. Copy that `CiphertextBlob` into an environment variable or wherever it needs to go.

To decrypt use: `aws kms decrypt --region us-west-2 --ciphertext-blob <theCiphertextBlobValue>`. This is essentially what `Secret.decrypt` is doing.

## Typed Event emitter

> The `started` and `shutdown` events are not currently emitted when running in "serverless" mode.

The standard nodejs [`EventEmitter`](https://nodejs.org/api/events.html#class-eventemitter) is great and plankton creates and exports a singleton instance for itself and applications to use.

> Plankton actually uses [`eventemitter3`](https://www.npmjs.com/package/eventemitter3) as its `EventEmitter` implementation.

Plankton coerces this `EventEmitter` into a `TypedEventEmitter<PlanktonEvents>` which maintains the same familiar API but allows for proper type checking on emitter usage.

At time of writing Plankton's `PlanktonEvents` looks like:

```typescript
type PlanktonEvents = {
  started: () => void;
  shutdown: (shutdownPromises: Promise<unknown>[]) => void;
};
```

> To see an example of `started` and `shutdown` event usage see the `src/boot/components` callback example earlier in this doc

This emitter can be augmented with application events. For example, imagine a service `foo` that emits a `bar` event with a `BarEvent` payload using the plankton emitter. First it creates a union `FooEvents` type that combines the `bar` event with those from `PlanktonEvents`:

```typescript
import { PlanktonEvents } from '@krmcbride/plankton';
import BarEvent from './bar-event';

export type FooEvents = {
  bar: (barEvent: BarEvent) => void;
} & PlanktonEvents;
```

Now a `TypedEventEmitter<FooEvents>` can be injected elsewhere:

```typescript
import { TypedEventEmitter } from '@krmcbride/plankton';
import { FooEvents } from '../../../core/foo-events';

export default (emitter: TypedEventEmitter<FooEvents>): Router => {
  const router = express.Router();
  router.post('/', (req, res, next) => {
    // ...
    emitter.emit('bar', barEvent); // type checking is applied, cool!
    // ...
  });
  return router;
};
```

Finally, you can coerce the original Plankton emitter into a `TypedEventEmitter<FooEvents>`:

```typescript
import { emitter as planktonEmitter, TypedEventEmitter } from '@krmcbride/plankton';
import { FooEvents } from '../../core/foo-events';

export const emitter = planktonEmitter as TypedEventEmitter<FooEvents>;
```

## Logging

A simple `LoggerFactory` is provided, inspired by SLF4J (simple logging facade for java).

```typescript
import { LoggerFactory } from '@krmcbride/plankton';

const LOG = LoggerFactory.getLogger('myservice.example.fooBar');

LOG.info('This is a message with placeholder %s', foo);
LOG.error(err, 'Oops, widget %s is broken', widget.id);
```

To enable pretty printing in development set the `LOGGING_PRETTY=` environment variable. Use the `LOGGING_LEVEL` prefix to adjust logger level thresholds.

```bash
# Sets the logger level for all loggers without a more
# specific level:
LOGGING_LEVEL=debug # The default level is info.
# Set a logger or group of loggers to a different level:
LOGGING_LEVEL_MY_NOISY_LOGGER=warn
# Shut off logging entirely for a set of loggers:
LOGGING_LEVEL_BE_QUIET=off
```

In the example above, a logger with name `foo.bar` falls back to the `debug` level, but a logger with name `my.noisy.logger` or `my.noisy.logger.foo.bar`, etc, will use the `warn` level.

The logger levels in order from least severe to most severe are: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.

Some logging best practices:

- Use `trace` sparingly. This level is typically reserved for tight loops or otherwise extremely high frequency code paths. One should expect that enabling `trace` could result in many thousands of logs in a short period of time.
- Use `debug` for "development tracing". That is, log messages that could be useful in development while verifying behavior. Consider removing some debug logging as a feature becomes more stable.
- Use `info` logging for startup and shutdown events, or other state changes that happen rarely but are useful to observe. Most of the time when we feel the urge to log something at `info` level we should really be publishing metrics instead. A healthy service doesn't need to log constantly to tell us its healthy. If we're trying to observe the behavior of a service, metrics are usually the way to do it (you can use logs to generate metrics but typically logs and metrics are different libraries/transports/backends, etc).
- Use `warn` for edge cases that may or may not indicate unexpected behavior. Warnings that trigger frequently should probably be investigated.
- Any unexpected `Error` should be logged at `error` level, with the `Error` included as the first argument, regardless of how/if the error is handled. An `error` log is always bad and unexpected. If an `error` is expected, it should be a warning or reexamined.
- `fatal` is typically reserved for a framework like Plankton and is used right before killing the nodejs process, for example during a failed startup or shutdown, or on an `uncaughtException`. You should only see `fatal` logs if a service is in a crash loop, or otherwise failing at low level.
