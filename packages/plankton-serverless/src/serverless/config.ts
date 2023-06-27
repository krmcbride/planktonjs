import { getProperty } from '@krmcbride/plankton-environment';
import { config } from '@krmcbride/plankton-express';
import { version } from '../../package.json';

export default {
  ...config,
  planktonVersion: version,
  appInfo: {
    name: getProperty('AWS_LAMBDA_FUNCTION_NAME', 'app'),
    version: getProperty('AWS_LAMBDA_FUNCTION_VERSION', 'dev-snapshot'),
  },
};
