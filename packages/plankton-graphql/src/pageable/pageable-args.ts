import { ArgsType, Field, InputType, Int, registerEnumType } from 'type-graphql';
import { Direction, Pageable, SortOrder } from '@krmcbride/plankton-data-commons';

@InputType()
export class SortOrderInput implements SortOrder {
  @Field(() => String)
  property!: string;

  @Field(() => Direction)
  direction!: Direction;
}

@ArgsType()
export class PageableArgs implements Partial<Pageable> {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  size?: number;

  @Field(() => [SortOrderInput], { nullable: true })
  sort?: SortOrderInput[];
}

registerEnumType(Direction, { name: 'SortDirection' });
