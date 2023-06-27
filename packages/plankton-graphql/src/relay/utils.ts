// See https://github.com/MichalLytek/type-graphql/issues/142#issuecomment-433120114

import { ConnectionCursor, fromGlobalId } from 'graphql-relay';
import type ConnectionArgs from './connection-args';

type PagingMeta =
  | { pagingType: 'forward'; after?: string; first: number }
  | { pagingType: 'backward'; before?: string; last: number }
  | { pagingType: 'none' };

const checkPagingSanity = (args: ConnectionArgs): PagingMeta => {
  const { first = 0, last = 0, after, before } = args;
  const isForwardPaging = !!first || !!after;
  const isBackwardPaging = !!last || !!before;
  if (isForwardPaging && isBackwardPaging) {
    throw new Error('cursor-based pagination cannot be forwards AND backwards');
  }
  if ((isForwardPaging && before) || (isBackwardPaging && after)) {
    throw new Error('paging must use either first/after or last/before');
  }
  if ((isForwardPaging && first < 0) || (isBackwardPaging && last < 0)) {
    throw new Error('paging limit must be positive');
  }
  // This is a weird corner case. We'd have to invert the ordering of query to get the
  // last few items then re-invert it when emitting the results.
  // We'll just ignore it for now.
  if (last && !before) {
    throw new Error("when paging backwards, a 'before' argument is required");
  }
  if (isForwardPaging) {
    return { pagingType: 'forward', after, first };
  }
  if (isBackwardPaging) {
    return { pagingType: 'backward', before, last };
  }
  return { pagingType: 'none' };
};

const getId = (cursor: ConnectionCursor) => parseInt(fromGlobalId(cursor).id, 10);
const nextId = (cursor: ConnectionCursor) => getId(cursor) + 1;

/**
 * Create a 'paging parameters' object with 'limit' and 'offset' fields based on the incoming
 * cursor-paging arguments.
 *
 * todo Handle the case when a user uses 'last' alone.
 */
// eslint-disable-next-line import/prefer-default-export
export const getPagingParameters = (args: ConnectionArgs): { limit: number; offset: number } => {
  const meta = checkPagingSanity(args);
  switch (meta.pagingType) {
    case 'forward': {
      return {
        limit: meta.first,
        offset: meta.after ? nextId(meta.after) : 0,
      };
    }
    case 'backward': {
      const { last, before } = meta;
      let limit = last;
      let offset = getId(before as string) - last;
      // Check to see if our before-page is underflowing past the 0th item
      if (offset < 0) {
        // Adjust the limit with the underflow value
        limit = Math.max(last + offset, 0);
        offset = 0;
      }
      return { offset, limit };
    }
    default:
      return { limit: 10, offset: 0 };
  }
};
