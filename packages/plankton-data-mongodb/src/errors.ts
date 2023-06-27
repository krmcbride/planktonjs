import { DataAccessError } from '@krmcbride/plankton-data-commons';

// eslint-disable-next-line import/prefer-default-export
export class InvalidObjectIdError extends DataAccessError {
  public constructor(objectId: string) {
    super(`Invalid ObjectID '${objectId}'`);
  }
}
