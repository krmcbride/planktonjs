import type { Document, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import { newObjectId } from './query-utils';

export default abstract class AbstractMongoDto implements OptionalUnlessRequiredId<Document> {
  _id?: ObjectId;

  createdDate?: Date;

  lastModifiedDate?: Date;

  version?: number;

  protected constructor(id?: string) {
    // eslint-disable-next-line no-underscore-dangle
    this._id = id ? newObjectId(id) : undefined;
  }
}
