import type * as Relay from 'graphql-relay';
import { ClassType, Field, ObjectType } from 'type-graphql';
import PageInfo from './page-info';

type ExtractNodeType<EdgeType> = EdgeType extends Relay.Edge<infer NodeType> ? NodeType : never;

export default function ConnectionType<
  EdgeType extends Relay.Edge<NodeType>,
  NodeType = ExtractNodeType<EdgeType>,
>(nodeName: string, edgeClass: ClassType<EdgeType>): { new (): Relay.Connection<NodeType> } {
  @ObjectType(`${nodeName}Connection`, { isAbstract: true })
  class Connection implements Relay.Connection<NodeType> {
    @Field(() => PageInfo)
    pageInfo!: PageInfo;

    @Field(() => [edgeClass])
    edges!: EdgeType[];
  }
  return Connection;
}
