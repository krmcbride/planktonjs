import Bluebird from 'bluebird';
import { Collection, Filter, FindOptions, MongoError } from 'mongodb';
import {
  DataAccessError,
  OptimisticLockFailureError,
} from '@krmcbride/plankton-data-commons';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import type AbstractMongoDto from './abstract-mongo-dto';
import type IndexDef from './index-def';
import type MongoRepository from './mongo-repository';
import { coveredProjectionFromFilter, newObjectId } from './query-utils';

const LOG = LoggerFactory.getLogger('plankton.data.mongodb.simpleMongoRepository');

export default class SimpleMongoRepository<T extends AbstractMongoDto>
  implements MongoRepository<T>
{
  // eslint-disable-line @typescript-eslint/indent
  protected readonly collectionSupplier: () => Promise<Collection>;

  private indicesEnsured = false;

  public constructor(collectionSupplier: () => Promise<Collection>) {
    this.collectionSupplier = collectionSupplier;
  }

  public async findById(id: string): Promise<T | undefined> {
    return this.findOne({ _id: newObjectId(id) });
  }

  public async save(dto: T): Promise<T> {
    // eslint-disable-next-line no-underscore-dangle
    if (dto._id) {
      return this.replaceOne(dto);
    }
    return this.insertOne(dto as T);
  }

  public async delete(dto: T): Promise<void> {
    // eslint-disable-next-line no-underscore-dangle
    if (dto._id) {
      // eslint-disable-next-line no-underscore-dangle
      await this.deleteOne({ _id: dto._id });
    }
  }

  public async deleteById(id: string): Promise<void> {
    return this.deleteOne({ _id: newObjectId(id) });
  }

  private async insertOne(dto: T): Promise<T> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    try {
      LOG.debug({ dto }, 'Inserting into col=%s', collectionName);
      // eslint-disable-next-line no-param-reassign
      dto.version = dto.version || 1;
      // eslint-disable-next-line no-param-reassign
      dto.createdDate = new Date();
      const result = await collection.insertOne(dto);
      LOG.debug(dto, 'Inserted into col=%s', collectionName);
      LOG.trace({ result });
      // Note that the driver mutates the input dto, setting the _id itself.
      // Forcing the server to generate the _id is possible but the _id is never returned.
      return dto;
    } catch (err) {
      LOG.error({ err }, 'Insert into col=%s failed', collectionName);
      throw new DataAccessError(`Insert into col=${collectionName} failed`, err);
    }
  }

  private async replaceOne(dto: T): Promise<T> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = dto;
    const version = dto.version || null;
    let matches = 0;
    if (!_id) {
      throw new Error('Sanity check on id failed');
    }
    // eslint-disable-next-line no-param-reassign
    dto.version = version === null ? 2 : version + 1; // treat no version as version 1
    // eslint-disable-next-line no-param-reassign
    dto.lastModifiedDate = new Date();
    try {
      LOG.debug('Replacing doc=%s,col=%s,v=%s', _id, collectionName, version);
      const result = await collection.replaceOne({ _id, version }, dto, { upsert: false });
      LOG.trace({ result });
      matches = result.matchedCount;
    } catch (err) {
      LOG.error({ err }, 'Replace of doc=%s,col=%s,v=%s failed', _id, collectionName, version);
      throw new DataAccessError(
        `Replace of doc=${_id},col=${collectionName},v=${version} failed`,
        err,
      );
    }
    if (matches !== 1) {
      LOG.error(
        'Replace of doc=%s,col=%s,v=%s expected 1 match, got %s',
        _id,
        collectionName,
        version,
        matches,
      );
      throw new OptimisticLockFailureError(
        `Replace of doc=${_id},col=${collectionName},v=${version} got ${matches} matches"`,
      );
    }
    LOG.debug('Replaced doc=%s,col=%s,v=%s', _id, collectionName, version);
    return dto;
  }

  protected async deleteOne(filter: Filter<unknown>): Promise<void> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    try {
      LOG.debug('Deleting doc in col=%s', collectionName);
      const result = await collection.deleteOne(filter);
      LOG.debug('Deleted doc in col=%s', collectionName);
      LOG.trace({ result });
    } catch (err) {
      LOG.error('Delete of doc in col=%s failed', collectionName, err);
      throw new DataAccessError(`Delete of doc in col=${collectionName} failed`, err);
    }
  }

  protected async findOne(filter: Filter<unknown>): Promise<T | undefined> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    try {
      LOG.debug('Finding doc in col=%s', collectionName, filter);
      const result = await collection.findOne(filter);
      if (result === null) {
        LOG.debug('Did not find doc in col=%s', collectionName, filter);
        return undefined;
      }
      LOG.debug('Found doc in col=%s', collectionName, filter);
      LOG.trace({ result });
      return result as T;
    } catch (err) {
      LOG.error('Find of doc in col=%s failed', collectionName, filter, err);
      throw new DataAccessError(`Look up of doc in col=${collectionName} failed`, err);
    }
  }

  protected async find(query: Filter<unknown>, options: FindOptions): Promise<T[]> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    try {
      LOG.debug('Finding docs in col=%s', collectionName, query);
      const results = await collection.find(query, options).toArray();
      LOG.debug('Found %s docs in col=%s', results.length, collectionName, query);
      LOG.trace({ results });
      return results as T[];
    } catch (err) {
      LOG.error('Find of docs in col=%s failed', collectionName, query, err);
      throw new DataAccessError(`Look up of docs in col=${collectionName} failed`, err);
    }
  }

  protected async count(query: Filter<unknown>): Promise<number> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    try {
      LOG.debug('Counting docs in col=%s', collectionName, query);
      // todo need to reexamine how this is implemented to ensure a covered query
      // const projection = coveredProjectionFromFilter(query);
      const count = await collection.countDocuments(query);
      LOG.debug('Counted %s docs in col=%s', count, collectionName, query);
      return count;
    } catch (err: unknown) {
      LOG.error('Count of docs in col=%s failed', collectionName, query, err);
      throw new DataAccessError(`Count of docs in col=${collectionName} failed`, err);
    }
  }

  protected async countAll(): Promise<number> {
    const collection = await this.collectionSupplier();
    await this.ensureIndices(collection);
    const { collectionName } = collection;
    try {
      LOG.debug('Counting all docs in col=%s', collectionName);
      const count = await collection.estimatedDocumentCount();
      LOG.debug('Counted %s docs in col=%s', count, collectionName);
      return count;
    } catch (err: unknown) {
      LOG.error('Count of docs in col=%s failed', collectionName, err);
      throw new DataAccessError(`Count of docs in col=${collectionName} failed`, err);
    }
  }

  protected async exists(query: Filter<unknown>): Promise<boolean> {
    const collection = await this.collectionSupplier();
    // If indexing is done correctly this will only read from the index
    const projection = coveredProjectionFromFilter(query);
    return (await collection.findOne(query, { projection })) !== null;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getIndexDefs(): IndexDef[] {
    return [];
  }

  private async ensureIndices(collection: Collection): Promise<void> {
    if (this.indicesEnsured) {
      return;
    }
    try {
      await Bluebird.each(this.getIndexDefs(), async (indexDef) => {
        if (!(await collection.indexExists(indexDef.name))) {
          LOG.debug('Creating index', indexDef);
          return collection.createIndex(indexDef.spec, {
            name: indexDef.name,
            unique: indexDef.unique,
            background: true,
          });
        }
        return Promise.resolve();
      });
    } catch (err) {
      if (err instanceof MongoError && err.code === 26) {
        LOG.warn('Skipping index creation due to NamespaceNotFound: %s', err.errmsg);
        return;
      }
      throw err;
    }
    this.indicesEnsured = true;
  }
}
