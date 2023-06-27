import 'reflect-metadata';

import { cursorToOffset, offsetToCursor } from 'graphql-relay';
import { connectionFactory } from './relay-extension';

describe('graphql/relay-extension', () => {
  describe('graphql-relay.offsetToCursor', () => {
    it('creates a cursor string from an offset int', () => {
      // echo -n 'arrayconnection:0' | base64
      expect(offsetToCursor(0)).toBe('YXJyYXljb25uZWN0aW9uOjA=');
      expect(cursorToOffset('YXJyYXljb25uZWN0aW9uOjA=')).toBe(0);
      // echo -n 'arrayconnection:23' | base64
      expect(offsetToCursor(23)).toBe('YXJyYXljb25uZWN0aW9uOjIz');
      expect(cursorToOffset('YXJyYXljb25uZWN0aW9uOjIz')).toBe(23);
    });
  });
  describe('gqlConnectionHelper', () => {
    it('creates a hasNextPage=true connection with offset range [0,2]', async () => {
      const arrayLength = 50;
      const arraySlice = [{ id: 3 }, { id: 5 }, { id: 6 }];
      const getSliceMock = jest.fn().mockReturnValue({ arraySlice, arrayLength });
      const result = await connectionFactory(getSliceMock, { first: 3 });
      expect(result.edgeCount).toBe(arrayLength);
      expect(cursorToOffset(result.pageInfo.startCursor as string)).toBe(0);
      expect(cursorToOffset(result.pageInfo.endCursor as string)).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(true); // has more pages
      expect(result.pageInfo.hasPreviousPage).toBe(false);
      expect(result.edges.length).toBe(3);
      expect(result.edges[0]).toEqual({ cursor: offsetToCursor(0), node: { id: 3 } });
      expect(cursorToOffset(result.edges[0].cursor)).toBe(0);
      expect(result.edges[1]).toEqual({ cursor: offsetToCursor(1), node: { id: 5 } });
      expect(cursorToOffset(result.edges[1].cursor)).toBe(1);
      expect(result.edges[2]).toEqual({ cursor: offsetToCursor(2), node: { id: 6 } });
      expect(cursorToOffset(result.edges[2].cursor)).toBe(2);
    });
    it('creates a hasNextPage=false connection with offset range [0,2]', async () => {
      const arrayLength = 3; // The entire array in one slice
      const arraySlice = [{ id: 3 }, { id: 5 }, { id: 6 }];
      const getSliceMock = jest.fn().mockReturnValue({ arraySlice, arrayLength });
      const result = await connectionFactory(getSliceMock, { first: 5 });
      expect(result.edgeCount).toBe(arrayLength);
      expect(cursorToOffset(result.pageInfo.startCursor as string)).toBe(0);
      expect(cursorToOffset(result.pageInfo.endCursor as string)).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(false); // no more pages
      expect(result.pageInfo.hasPreviousPage).toBe(false);
      expect(result.edges.length).toBe(3);
      expect(result.edges[0]).toEqual({ cursor: offsetToCursor(0), node: { id: 3 } });
      expect(cursorToOffset(result.edges[0].cursor)).toBe(0);
      expect(result.edges[1]).toEqual({ cursor: offsetToCursor(1), node: { id: 5 } });
      expect(cursorToOffset(result.edges[1].cursor)).toBe(1);
      expect(result.edges[2]).toEqual({ cursor: offsetToCursor(2), node: { id: 6 } });
      expect(cursorToOffset(result.edges[2].cursor)).toBe(2);
    });
    it('creates a hasNextPage=true connection with offset range [3,5]', async () => {
      const arrayLength = 50;
      const arraySlice = [{ id: 10 }, { id: 12 }, { id: 15 }];
      const getSliceMock = jest.fn().mockReturnValue({ arraySlice, arrayLength });
      const result = await connectionFactory(getSliceMock, { first: 3, after: offsetToCursor(2) });
      expect(result.edgeCount).toBe(arrayLength);
      expect(cursorToOffset(result.pageInfo.startCursor as string)).toBe(3);
      expect(cursorToOffset(result.pageInfo.endCursor as string)).toBe(5);
      expect(result.pageInfo.hasNextPage).toBe(true); // has more pages
      expect(result.pageInfo.hasPreviousPage).toBe(false); // only true when reverse scrolling
      expect(result.edges.length).toBe(3);
      expect(result.edges[0]).toEqual({ cursor: offsetToCursor(3), node: { id: 10 } });
      expect(cursorToOffset(result.edges[0].cursor)).toBe(3);
      expect(result.edges[1]).toEqual({ cursor: offsetToCursor(4), node: { id: 12 } });
      expect(cursorToOffset(result.edges[1].cursor)).toBe(4);
      expect(result.edges[2]).toEqual({ cursor: offsetToCursor(5), node: { id: 15 } });
      expect(cursorToOffset(result.edges[2].cursor)).toBe(5);
    });
  });
});
