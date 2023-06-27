import 'reflect-metadata';
import '@krmcbride/plankton-environment/dist/src/boot';

import type { ApolloServer } from 'apollo-server-express';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Callback,
  Context,
  Handler,
} from 'aws-lambda';
import type { Express } from 'express';
import {
  CodeDeployClient,
  LifecycleEventStatus,
  PutLifecycleEventHookExecutionStatusCommand,
} from '@aws-sdk/client-codedeploy';
import { checkHealth } from '@krmcbride/plankton-health';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import { createHandler } from './serverless';

const LOG = LoggerFactory.getLogger('plankton.serverless.boot');
const codeDeployClient = new CodeDeployClient({ region: 'us-west-2' });
const handlerPromise = createHandler();

export const api: APIGatewayProxyHandler & {
  app: Promise<Express>;
  apollo: Promise<ApolloServer>;
} = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>,
): Promise<APIGatewayProxyResult> => handlerPromise.then((h) => h(event, context, callback));
api.app = handlerPromise.then((h) => h.app);
api.apollo = handlerPromise.then((h) => h.apollo);

export const preflight: Handler & { checkHealth: () => Promise<unknown> } = (event: {
  DeploymentId: string;
  LifecycleEventHookExecutionId: string;
}): Promise<void> => {
  LOG.info('Preflight check invoked, waiting for handler');
  return handlerPromise
    .then(() => {
      LOG.info({ event }, 'Handler is alive, checking service readiness');
      return checkHealth().then((checkInfo) => {
        LOG.info({ checkInfo }, 'Service is ready');
        return LifecycleEventStatus.SUCCEEDED;
      });
    })
    .catch((err) => {
      LOG.error({ err }, 'Preflight readiness check failed');
      return LifecycleEventStatus.FAILED;
    })
    .then((status) => {
      LOG.info('Sending deployment status=%s', status);
      return codeDeployClient
        .send(
          new PutLifecycleEventHookExecutionStatusCommand({
            deploymentId: event.DeploymentId,
            lifecycleEventHookExecutionId: event.LifecycleEventHookExecutionId,
            status,
          }),
        )
        .then(() => {
          LOG.info('Deployment status updated');
        })
        .catch((err) => {
          LOG.error({ err }, 'Caught error while updating deployment status');
          throw err;
        });
    });
};
preflight.checkHealth = checkHealth;
