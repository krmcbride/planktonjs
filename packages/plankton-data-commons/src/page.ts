import type Pageable from './pageable';

export default interface Page<T> {
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  content: T[];
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  pageable: Pageable;
}

export class PageImpl<T> implements Page<T> {
  readonly totalPages: number;

  readonly number: number;

  readonly size: number;

  readonly isFirst: boolean;

  readonly isLast: boolean;

  readonly hasNext: boolean;

  readonly hasPrevious: boolean;

  public constructor(
    readonly content: T[],
    readonly pageable: Pageable,
    readonly totalElements: number,
  ) {
    this.size = this.pageable.size;
    this.number = this.pageable.page;
    this.totalPages = this.size === 0 ? 1 : Math.ceil(this.totalElements / this.size);
    this.hasNext = this.number + 1 < this.totalPages;
    this.hasPrevious = this.number > 0;
    this.isFirst = !this.hasPrevious;
    this.isLast = !this.hasNext;
  }
}
