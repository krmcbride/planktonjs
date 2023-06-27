import { getProperty } from '@krmcbride/plankton-environment';
import { config } from '@krmcbride/plankton-express';
import { version } from '../../package.json';

export default {
  ...config,
  planktonVersion: version,
  appInfo: {
    name: getProperty('DD_SERVICE_NAME', getProperty('DD_SERVICE', 'app')),
    version: getProperty('DD_VERSION', 'dev-snapshot'),
  },
  serverPort: Number(getProperty('SERVER_PORT', '8080')),
  serverIp: getProperty('SERVER_IP', '0.0.0.0'),
  // The terminationGracePeriodSeconds is usually 30 seconds so this won't matter
  shutdownTimeoutMillis: 60000,
  // In production this should be a little longer than readinessProbe.periodSeconds
  shutdownPauseMillis: Number(
    getProperty(
      'PLANKTON_SHUTDOWN_PAUSE_MILLIS',
      process.env.NODE_ENV === 'production' ? '15000' : '0',
    ),
  ),
};
