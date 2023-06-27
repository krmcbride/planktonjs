import { Collection, ReturnDocument } from 'mongodb';
import { DataAccessError } from '@krmcbride/plankton-data-commons';
import {
  AbstractMongoDto,
  IndexDef,
  SimpleMongoRepository,
  newObjectId,
} from '@krmcbride/plankton-data-mongodb';
import type WorkQueue from '../../work-queue';
import type WorkQueueJobDetails from '../../work-queue-job-details';
import WorkQueueJobState from '../../work-queue-job-state';

const INDEX_DEFS = [new IndexDef('work_queue_idx_dequeue_2', { name: 1, state: 1 })];

export class MongoWorkQueueDto<T extends WorkQueueJobDetails> extends AbstractMongoDto {
  public readonly name: string;

  public readonly details: T;

  public state: WorkQueueJobState = WorkQueueJobState.PENDING;

  public results?: Record<string, unknown>;

  public runningDate?: Date;

  public completedDate?: Date;

  public failedDate?: Date;

  public constructor(name: string, details: T, id?: string) {
    super(id);
    this.name = name;
    this.details = details;
  }
}

export default class MongoWorkQueue<T extends WorkQueueJobDetails>
  extends SimpleMongoRepository<MongoWorkQueueDto<T>>
  implements WorkQueue<T>
{
  public readonly jobName: string;

  public constructor(jobName: string, collectionSupplier: () => Promise<Collection>) {
    super(collectionSupplier);
    this.jobName = jobName;
  }

  // Mainly a convenience method for integration testing
  public getCollection(): Promise<Collection> {
    return this.collectionSupplier();
  }

  public async enqueue(jobDetails: T): Promise<string> {
    // eslint-disable-next-line no-underscore-dangle
    const jobId = (
      await this.save(new MongoWorkQueueDto(this.jobName, jobDetails))
    )._id?.toHexString() as string;
    return jobId;
  }

  public async dequeue(): Promise<{ jobId: string; jobDetails: T } | null> {
    const collection = await this.collectionSupplier();
    try {
      const { value } = await collection.findOneAndUpdate(
        {
          name: this.jobName,
          state: WorkQueueJobState.PENDING,
        },
        {
          $set: {
            lastModifiedDate: new Date(),
            state: WorkQueueJobState.RUNNING,
            runningDate: new Date(),
          },
        },
        { returnDocument: ReturnDocument.AFTER }, // return updated doc
      );
      if (value) {
        return {
          // eslint-disable-next-line no-underscore-dangle
          jobId: value._id?.toHexString() as string,
          jobDetails: value.details,
        };
      }
      return null;
    } catch (err: unknown) {
      throw new DataAccessError('Dequeue failed', err);
    }
  }

  public async ack(jobId: string, jobResults: unknown): Promise<void> {
    try {
      await (
        await this.collectionSupplier()
      ).findOneAndUpdate(
        { _id: newObjectId(jobId) },
        {
          $set: {
            lastModifiedDate: new Date(),
            state: WorkQueueJobState.COMPLETED,
            completedDate: new Date(),
            results: jobResults,
          },
        },
        { returnDocument: ReturnDocument.AFTER }, // return updated doc
      );
    } catch (err: unknown) {
      throw new DataAccessError('ACK failed', err);
    }
  }

  public async nack(jobId: string, jobResults: unknown): Promise<void> {
    try {
      await (
        await this.collectionSupplier()
      ).findOneAndUpdate(
        { _id: newObjectId(jobId) },
        {
          $set: {
            lastModifiedDate: new Date(),
            state: WorkQueueJobState.FAILED,
            failedDate: new Date(),
            results: jobResults,
          },
        },
        { returnDocument: ReturnDocument.AFTER }, // return updated doc
      );
    } catch (err: unknown) {
      throw new DataAccessError('NACK failed', err);
    }
  }

  public async stat(jobId: string): Promise<{
    jobState: WorkQueueJobState;
    jobResults?: Record<string, unknown>;
  } | null> {
    try {
      const jobDto = await (await this.collectionSupplier()).findOne({ _id: newObjectId(jobId) });
      if (jobDto === null) {
        return null;
      }
      return {
        jobState: jobDto.state,
        jobResults: jobDto.results,
      };
    } catch (err: unknown) {
      throw new DataAccessError(`Stat of job with id=${jobId} failed`, err);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected getIndexDefs(): IndexDef[] {
    return INDEX_DEFS;
  }
}
