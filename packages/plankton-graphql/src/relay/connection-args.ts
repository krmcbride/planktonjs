import type * as Relay from 'graphql-relay';
import { ArgsType, Field } from 'type-graphql';

/**
 * ## Forward pagination arguments
 * To enable forward pagination, two arguments are required.
 *
 * first takes a non-negative integer.
 * after takes the cursor type as described in the cursor field section.
 * The server should use those two arguments to modify the edges returned by the connection, returning edges after the after cursor, and returning at most first edges.
 *
 * You should generally pass the cursor of the last edge in the previous page for after.
 *
 * > Think "first 10 items after the 5th item", aka "ORDER BY id ASC OFFSET 5 LIMIT 10"
 *
 * ## Backward pagination arguments
 * To enable backward pagination, two arguments are required.
 *
 * last takes a non-negative integer.
 * before takes the cursor type as described in the cursor field section.
 * The server should use those two arguments to modify the edges returned by the connection, returning edges before the before cursor, and returning at most last edges.
 *
 * You should generally pass the cursor of the first edge in the next page for before.
 *
 * > Think "last 10 items before the 5th to the last item", aka "ORDER BY id DESC OFFSET 5 LIMIT 10"
 * > IMPORTANT: these results must then be reversed into ASC order
 *
 * @see https://relay.dev/graphql/connections.htm#sec-Forward-pagination-arguments
 * @see https://relay.dev/graphql/connections.htm#sec-Backward-pagination-arguments
 */
@ArgsType()
export default class ConnectionArgs implements Relay.ConnectionArguments {
  @Field(() => Number, { nullable: true, description: 'Paginate first' })
  first?: number;

  @Field(() => String, { nullable: true, description: 'Paginate after opaque cursor' })
  after?: Relay.ConnectionCursor;

  @Field(() => Number, { nullable: true, description: 'Paginate last' })
  last?: number;

  @Field(() => String, { nullable: true, description: 'Paginate before opaque cursor' })
  before?: Relay.ConnectionCursor;
}
