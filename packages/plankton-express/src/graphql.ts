import { ApolloServer } from 'apollo-server-express';
import type { Application, Request, Response } from 'express';
import type { GraphQLError, GraphQLSchema } from 'graphql';
import { emitter } from '@krmcbride/plankton-emitter';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import { accessMiddlewareChainFactory } from './auth/access-middleware-chain-factory';
import type AuthenticatedRequest from './auth/model/authenticated-request';
import type Authentication from './auth/model/authentication';
import config from './config';

const LOG = LoggerFactory.getLogger('plankton.express.graphql');

export interface Principal {
  uuid: string;
}

export interface User extends Principal {
  username: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
}

export interface Context {
  req: Request;
  auth?: Authentication;
  user?: User;
  access: (expression: string) => Promise<void>;
}

class RequestContext implements Context {
  constructor(readonly req: AuthenticatedRequest, readonly res: Response) {}

  get auth(): Authentication | undefined {
    return this.req.auth;
  }

  get user(): User | undefined {
    if (this.req.auth) {
      return {
        uuid: this.req.auth.account_uuid as string,
        username: this.req.auth.user_name as string,
        emailAddress: this.req.auth.account_email as string,
        firstName: this.req.auth.account_first_name,
        lastName: this.req.auth.account_last_name,
      };
    }
    return undefined;
  }

  access(expression: string): Promise<void> {
    const middleware = accessMiddlewareChainFactory(config.verifier)(expression);
    return new Promise((resolve, reject) => {
      middleware(this.req, this.res, (err) => {
        if (err) {
          LOG.debug(err, 'Rejecting on error thrown from RequestContext.access');
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

// See if there is a `code` string on the Error, otherwise use its `name`, else
// just leave the default. Copy the Error name and message to the extensions
// hash if those properties don't already exist
const remapError = (graphQlError: GraphQLError) => {
  // If we already have something more interesting than the default, keep it
  if (
    graphQlError.extensions.code !== 'INTERNAL_SERVER_ERROR' ||
    graphQlError.extensions.message ||
    graphQlError.extensions.name
  ) {
    return;
  }
  const { originalError } = graphQlError;
  const { code, name, message } = originalError as Error & { code?: unknown };
  // We only use strings to keep the original intent of the code field
  if (typeof code === 'string') {
    // eslint-disable-next-line no-param-reassign
    graphQlError.extensions.code = code;
  } else if (name) {
    // eslint-disable-next-line no-param-reassign
    graphQlError.extensions.code = name;
  }
  // eslint-disable-next-line no-param-reassign
  graphQlError.extensions.name = name;
  // eslint-disable-next-line no-param-reassign
  graphQlError.extensions.message = message;
};

// eslint-disable-next-line import/prefer-default-export
export const createGraphqlServer = async (
  app: Application,
  schema: GraphQLSchema,
): Promise<ApolloServer> => {
  const server = new ApolloServer({
    // Always include stack traces in errors
    debug: true,
    context: ({ req, res }): Context => new RequestContext(req, res),
    formatError: (graphQlError: GraphQLError) => {
      // Use a better error code if possible
      remapError(graphQlError);
      // Log all errors in full
      LOG.error({ graphQlError });
      // Remove the stacktrace which we never want to send to clients
      // eslint-disable-next-line no-param-reassign
      delete graphQlError.extensions.exception;
      return graphQlError;
    },
    logger: LOG,
    schema,
  });
  LOG.info('Starting graphql server');
  await server.start();
  emitter.once('shutdown', (promises: Promise<unknown>[]) => {
    LOG.info('Shutting down graphql server');
    promises.push(server.stop());
  });
  app.use(server.getMiddleware({ path: '/graphql', disableHealthCheck: true }));
  return server;
};
