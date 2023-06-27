import { Logger, MongoClient, MongoClientOptions } from 'mongodb';
import { LoggerFactory } from '@krmcbride/plankton-logger';

const LOG = LoggerFactory.getLogger('plankton.data.mongodb.connectionFactory');

const driverLogger = LoggerFactory.getLogger('mongodb.driver');
const expectedLoggingLevels = ['debug', 'info', 'error'];
type ExpectedLoggingLevel = 'debug' | 'info' | 'error';

// See https://docs.mongodb.com/drivers/node/fundamentals/logging/
Logger.setLevel('debug');
Logger.setCurrentLogger((formattedMessage, state) => {
  if (state !== undefined) {
    const givenLoggingLevel = state.type.toLowerCase();
    const givenRawMessage = state.message;
    if (expectedLoggingLevels.includes(givenLoggingLevel)) {
      // The preferred approach is to use their level and raw message
      driverLogger[givenLoggingLevel as ExpectedLoggingLevel](givenRawMessage, {
        className: state.className,
      });
    } else {
      // If for some reason we don't recognize the given logging level just use debug
      driverLogger.debug(givenRawMessage);
    }
  } else if (formattedMessage !== undefined) {
    // If for some reason we have no state, just use debug and the formatted message
    driverLogger.debug(formattedMessage);
  } else {
    driverLogger.warn('Logger callback was invoked but no message was given');
  }
});

export type MongoConfig = {
  uri: string;
};

const DEFAULT_CONFIG: MongoConfig = {
  uri: 'mongodb://localhost:27017/test',
};

export default async (customConfig?: MongoConfig): Promise<MongoClient> => {
  const config = { ...DEFAULT_CONFIG, ...(customConfig || {}) };
  const options: MongoClientOptions = {};
  const client = new MongoClient(config.uri, options);
  client
    .on('serverOpening', (serverOpeningEvent) =>
      LOG.isLevelEnabled('debug')
        ? LOG.debug({ serverOpeningEvent }, 'MongoClient serverOpening')
        : LOG.info('MongoClient serverOpening for %s', serverOpeningEvent.address),
    )
    .on('serverClosed', (serverClosedEvent) =>
      LOG.isLevelEnabled('debug')
        ? LOG.debug({ serverClosedEvent }, 'MongoClient serverClosed')
        : LOG.info('MongoClient serverClosed for %s', serverClosedEvent.address),
    )
    .on('serverDescriptionChanged', (serverDescriptionChangedEvent) =>
      LOG.debug({ serverDescriptionChangedEvent }, 'MongoClient serverDescriptionChanged'),
    )
    .on('serverDescriptionChanged', (serverDescriptionChangedEvent) => {
      const before = serverDescriptionChangedEvent?.previousDescription?.type;
      const after = serverDescriptionChangedEvent?.newDescription?.type;
      if (before !== after) {
        LOG.info(
          'MongoClient serverDescriptionChanged from %s to %s for %s',
          before,
          after,
          serverDescriptionChangedEvent.address,
        );
      }
    })
    .on('topologyOpening', (topologyOpeningEvent) =>
      LOG.debug({ topologyOpeningEvent }, 'MongoClient topologyOpening'),
    )
    .on('topologyClosed', (topologyClosedEvent) =>
      LOG.debug({ topologyClosedEvent }, 'MongoClient topologyClosed'),
    )
    .on('topologyDescriptionChanged', (topologyDescriptionChangedEvent) =>
      LOG.debug({ topologyDescriptionChangedEvent }, 'MongoClient topologyDescriptionChanged'),
    )
    .on('topologyDescriptionChanged', (topologyDescriptionChangedEvent) => {
      const before = topologyDescriptionChangedEvent?.previousDescription?.type;
      const after = topologyDescriptionChangedEvent?.newDescription?.type;
      if (before !== after) {
        LOG.info('MongoClient topologyDescriptionChanged from %s to %s', before, after);
      }
    })
    .on('serverHeartbeatFailed', (serverHeartbeatFailedEvent) =>
      LOG.warn({ serverHeartbeatFailedEvent }, 'MongoClient serverHeartbeatFailed'),
    );
  const buildInfo = await (await client.connect()).db().command({ buildInfo: 1 });
  LOG.info('Connected to mongodb %s', buildInfo.version);
  return client;
};
