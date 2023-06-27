import { ObjectId } from 'mongodb';
import { PageRequest, Sort } from '@krmcbride/plankton-data-commons';
import { InvalidObjectIdError } from './errors';
import { newObjectId, pageableOpts } from './query-utils';

describe('query-utils', () => {
  it('exposes a pageableOpts function', () => {
    expect(pageableOpts).toEqual(expect.any(Function));
  });
  it('exposes a newObjectId function', () => {
    expect(newObjectId).toEqual(expect.any(Function));
  });
  describe('newObjectId function', () => {
    it('takes a Mongo ObjectID as a string and returns a ObjectId object', () => {
      expect(newObjectId('57e068be89701100019dd9aa')).toEqual(
        new ObjectId('57e068be89701100019dd9aa'),
      );
    });
    it('throws if the ObjectID hex string is bogus', () => {
      expect(() => newObjectId('not an object id')).toThrow(InvalidObjectIdError);
    });
  });
  describe('pageableOpts function', () => {
    it('takes a Pageable model and returns an object with skip, limit and sort params', () => {
      expect(
        pageableOpts(new PageRequest(2, 50, Sort.by('lastModifiedDate').descending().orders)),
      ).toEqual({
        skip: 100,
        limit: 50,
        sort: [['lastModifiedDate', -1]],
      });
      expect(
        pageableOpts(new PageRequest(0, 20, Sort.by('lastModifiedDate').ascending().orders)),
      ).toEqual({
        skip: 0,
        limit: 20,
        sort: [['lastModifiedDate', 1]],
      });
      expect(
        pageableOpts(
          new PageRequest(
            0,
            1,
            Sort.by('priority').descending().and(Sort.by('createdDate').ascending()).orders,
          ),
        ),
      ).toEqual({
        skip: 0,
        limit: 1,
        sort: [
          ['priority', -1],
          ['createdDate', 1],
        ],
      });
      expect(pageableOpts(new PageRequest(0, 1))).toEqual({
        skip: 0,
        limit: 1,
        sort: [],
      });
      expect(pageableOpts()).toEqual({});
    });
  });
});
