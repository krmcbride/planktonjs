import pino from 'pino';
import pretty from 'pino-pretty';
import { getProperty, getPropertyAsBoolean } from '@krmcbride/plankton-environment';
import Logger, { Level, levels } from './logger';

const DEFAULT_LEVEL = 'info';
const LOGGER_PREFIX = 'logging.level';

const toLevel = (str: string): Level => {
  if (levels.includes(str.toLowerCase() as Level)) {
    if (str === 'off') {
      return 'silent'; // pino doesn't actually support "off" but we do
    }
    return str.toLowerCase() as Level;
  }
  return DEFAULT_LEVEL;
};

const getLoggerLevel = (property: string): Level => {
  const level = getProperty(property, '');
  if (level !== '') {
    return toLevel(level);
  }
  if (property === LOGGER_PREFIX) {
    return DEFAULT_LEVEL;
  }
  return getLoggerLevel(property.split('.').slice(0, -1).join('.'));
};

const rootLogger = getPropertyAsBoolean('logging.pretty', false)
  ? pino(
      pretty({
        sync: true,
        translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss.l'Z'",
        ignore: 'pid,hostname',
      }),
    )
  : pino({
      formatters: {
        level(level) {
          // Use the text instead of the number
          return { level };
        },
      },
    });

rootLogger.level = getLoggerLevel(LOGGER_PREFIX);

export default class LoggerFactory {
  static getLogger(name: string) {
    return new Logger(
      rootLogger.child(
        // data to include in every log
        {
          name,
        },
        // child logger overrides
        {
          name,
          level: getLoggerLevel([LOGGER_PREFIX, name].join('.')),
        },
      ),
    );
  }
}
