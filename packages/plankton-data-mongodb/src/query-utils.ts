import { Filter, ObjectId } from 'mongodb';
import { Direction, Pageable, SortOrder } from '@krmcbride/plankton-data-commons';
import { InvalidObjectIdError } from './errors';

interface MongoPageable {
  limit?: number;
  skip?: number;
  sort?: [string, number][];
}

const toMongoSort = (order: SortOrder): [string, number] => [
  order.property,
  order.direction === Direction.ASC ? 1 : -1,
];

export const pageableOpts = (pageable?: Pageable): MongoPageable => {
  if (!pageable) {
    return {};
  }
  return {
    limit: pageable.size,
    skip: pageable.offset,
    sort: pageable.sort.map((order) => toMongoSort(order)),
  };
};

export const newObjectId = (hexStr: string): ObjectId => {
  try {
    return new ObjectId(hexStr);
  } catch (err) {
    throw new InvalidObjectIdError(hexStr);
  }
};

// Attempt to construct a cheap "covered" query projection.
// Creates a projection where each field in the given filter is included but the _id is not.
// Assuming the index used contains all fields in the projection, results may be read directly
// from the index.
// https://docs.mongodb.com/manual/core/query-optimization/#covered-query
// eslint-disable-next-line class-methods-use-this
export const coveredProjectionFromFilter = async (
  filter: Filter<unknown>,
): Promise<Record<string, unknown>> => {
  const projection = Object.keys(filter).reduce((previous: Record<string, number>, current) => {
    // eslint-disable-next-line no-param-reassign
    previous[current] = 1;
    return previous;
  }, {});
  // eslint-disable-next-line no-underscore-dangle
  projection._id = 0;
  return projection;
};
