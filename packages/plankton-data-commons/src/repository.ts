export default interface Repository<T, ID> {
  findById(id: ID): Promise<T | undefined>;
}
