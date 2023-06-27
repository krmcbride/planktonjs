import { BuildSchemaOptions, buildSchema as typeGqlBuildSchema } from 'type-graphql';
import authChecker from './auth-checker';

// eslint-disable-next-line import/prefer-default-export
export default (options: BuildSchemaOptions) =>
  typeGqlBuildSchema({
    authChecker,
    ...options,
  });
