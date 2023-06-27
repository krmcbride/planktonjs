import type { Context, Principal } from '@krmcbride/plankton-express/dist/src/graphql';

export default Context;
export type { Authentication, AuthenticatedRequest } from '@krmcbride/plankton-express';
export type { Principal };

export type AuthenticatedCtx = Required<Context>;
