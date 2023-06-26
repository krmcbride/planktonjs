export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const DEFAULT_DIRECTION = Direction.ASC;

export interface SortOrder {
  property: string;
  direction: Direction;
}

export class SortOrderImpl implements SortOrder {
  public readonly direction: Direction;

  public constructor(direction: Direction | null, public readonly property: string) {
    this.direction = direction || DEFAULT_DIRECTION;
  }
}

export default class Sort {
  public static by(...orders: (string | SortOrder)[]): Sort {
    return new Sort(
      orders.map((order) => (typeof order === 'string' ? new SortOrderImpl(null, order) : order)),
    );
  }

  private constructor(public readonly orders: SortOrder[]) {}

  public ascending(): Sort {
    return new Sort(this.orders.map((order) => new SortOrderImpl(Direction.ASC, order.property)));
  }

  public descending(): Sort {
    return new Sort(this.orders.map((order) => new SortOrderImpl(Direction.DESC, order.property)));
  }

  public and(sort: Sort): Sort {
    return new Sort(this.orders.concat(sort.orders));
  }
}

export const UNSORTED = Sort.by().orders;
