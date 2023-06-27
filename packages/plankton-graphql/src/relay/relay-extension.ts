import { Connection as RelayConnection, connectionFromArraySlice } from 'graphql-relay';
import type ConnectionArgs from './connection-args';
import { getPagingParameters } from './utils';

export interface Connection<T> extends RelayConnection<T> {
  edgeCount: number;
}

export const connectionFactory = async <T>(
  getSlice: (offset: number, limit: number) => Promise<{ arraySlice: T[]; arrayLength: number }>,
  connectionArgs: ConnectionArgs,
): Promise<Connection<T>> => {
  const { limit, offset } = getPagingParameters(connectionArgs);
  const { arraySlice, arrayLength } = await getSlice(offset, limit);
  return {
    edgeCount: arrayLength,
    ...connectionFromArraySlice(arraySlice, connectionArgs, {
      arrayLength,
      sliceStart: offset,
    }),
  };
};
