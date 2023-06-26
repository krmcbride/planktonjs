import type Repository from './repository';

export default interface CrudRepository<T, ID> extends Repository<T, ID> {
  save(item: T): Promise<T>;
  delete(item: T): Promise<void>;
  deleteById(id: ID): Promise<void>;
}
