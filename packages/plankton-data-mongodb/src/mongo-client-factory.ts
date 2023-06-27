import type { MongoClient } from 'mongodb';
import { emitter } from '@krmcbride/plankton-emitter';
import { HealthCheckError } from '@krmcbride/plankton-health';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import mongodbConnectionFactory, { MongoConfig } from './connection-factory';

const LOG = LoggerFactory.getLogger('plankton.data.mongodb.mongoClientFactory');

let mongoClientPromise: Promise<MongoClient>;

export const mongoClientFactory = (config: MongoConfig): Promise<MongoClient> => {
  if (mongoClientPromise) {
    return mongoClientPromise;
  }
  LOG.info('Creating new MongoClient');
  mongoClientPromise = mongodbConnectionFactory(config).then((mongoClient) => {
    emitter.once('shutdown', (promises) => {
      LOG.info('Closing MongoClient');
      promises.push(mongoClient.close());
    });
    return mongoClient;
  });
  return mongoClientPromise;
};

export const mongoHealthIndicator = async () => {
  // isConnected was removed in 4.x so all we can do is check the promise was resolved ¯\_(ツ)_/¯
  if (mongoClientPromise && (await mongoClientPromise)) {
    return { status: 'connected' };
  }
  throw new HealthCheckError('Mongo is not connected', undefined);
};
