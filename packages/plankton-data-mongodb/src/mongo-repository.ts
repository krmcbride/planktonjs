import type { CrudRepository } from '@krmcbride/plankton-data-commons';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface MongoRepository<T> extends CrudRepository<T, string> {}
