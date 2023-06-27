import type * as Relay from 'graphql-relay';
import { ClassType, Field, ObjectType } from 'type-graphql';

export default function EdgeType<NodeType>(
  nodeName: string,
  nodeType: ClassType<NodeType>,
): { new (): Relay.Edge<NodeType> } {
  @ObjectType(`${nodeName}Edge`, { isAbstract: true })
  class Edge implements Relay.Edge<NodeType> {
    @Field(() => nodeType)
    node!: NodeType;

    @Field(() => String, { description: 'Used in `before` and `after` args' })
    cursor!: Relay.ConnectionCursor;
  }
  return Edge;
}
