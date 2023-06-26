import { SortOrder, UNSORTED } from './sort';

export const DEFAULT_PAGE_SIZE = 100;

export default interface Pageable {
  page: number;
  offset: number;
  size: number;
  sort: SortOrder[];
}

export class PageRequest implements Pageable {
  readonly page: number;

  readonly offset: number;

  readonly size: number;

  readonly sort: SortOrder[];

  public constructor(page?: number, size?: number, sort?: SortOrder[]) {
    this.page = page ?? 0;
    this.size = size ?? DEFAULT_PAGE_SIZE;
    this.sort = sort || UNSORTED;
    this.offset = this.page * this.size;
  }
}
