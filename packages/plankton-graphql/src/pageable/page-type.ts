import { ClassType, Field, Int, ObjectType } from 'type-graphql';
import type { Page } from '@krmcbride/plankton-data-commons';

export default function PageType<ElementType>(
  elementName: string,
  elementClass: ClassType<ElementType>,
): { new (): Page<ElementType> } {
  @ObjectType(`${elementName}Page`, { isAbstract: true })
  class PageImpl implements Page<ElementType> {
    @Field(() => Int)
    totalPages!: number;

    @Field(() => Int)
    totalElements!: number;

    @Field(() => Int)
    number!: number;

    @Field(() => Int)
    size!: number;

    @Field(() => [elementClass])
    content!: ElementType[];

    @Field(() => Boolean)
    isFirst!: boolean;

    @Field(() => Boolean)
    isLast!: boolean;

    @Field(() => Boolean)
    hasNext!: boolean;

    @Field(() => Boolean)
    hasPrevious!: boolean;
  }
  return PageImpl;
}
