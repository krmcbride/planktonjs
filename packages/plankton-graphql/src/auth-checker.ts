import { GraphQLError } from 'graphql';
import type { AuthChecker } from 'type-graphql';
import type Context from './context';

// Covers both the HttpClientErrors thrown by plankton and express-jwt UnauthorizedErrors
type HttpClientError = {
  status?: number;
  statusCode?: number;
  name?: string;
  code?: string;
  message?: string;
  inner?: unknown;
};

const doAccess = async (access: () => Promise<void>): Promise<boolean> => {
  try {
    await access();
    return true;
  } catch (err) {
    const httpClientError = err as HttpClientError;
    const statusCode = httpClientError.statusCode || httpClientError.status;
    const message =
      httpClientError.message || httpClientError.code || httpClientError.name || 'HttpClientError';
    const extensions = {
      name: httpClientError.name,
      code: httpClientError.code,
      inner: httpClientError.inner,
      message: httpClientError.message,
    };
    if (statusCode === 403) {
      throw new GraphQLError(message, {
        extensions: {
          code: 'FORBIDDEN',
          extensions,
        },
      });
    }
    if (statusCode === 401) {
      throw new GraphQLError(message, {
        extensions: {
          code: 'UNAUTHENTICATED',
          extensions,
        },
      });
    }
    throw err;
  }
};

const authChecker: AuthChecker<Context> = async ({ context }, roles): Promise<boolean> => {
  if (roles.length === 0) {
    return doAccess(() => context.access('isAuthenticated()'));
  }
  return doAccess(() => context.access(`hasAnyRole(...${JSON.stringify(roles)})`));
};

export default authChecker;
