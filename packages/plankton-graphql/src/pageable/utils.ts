import { Page, PageRequest, Pageable } from '@krmcbride/plankton-data-commons';
import type { PageableArgs } from './pageable-args';

export const createPage = <T>(page: Page<T>): Page<T> => ({
  content: page.content,
  hasNext: page.hasNext,
  hasPrevious: page.hasPrevious,
  isFirst: page.isFirst,
  isLast: page.isLast,
  number: page.number,
  size: page.size,
  totalElements: page.totalElements,
  totalPages: page.totalPages,
});

export const createPageable = (pageableArgs: PageableArgs): Pageable =>
  new PageRequest(pageableArgs.page, pageableArgs.size, pageableArgs.sort);
