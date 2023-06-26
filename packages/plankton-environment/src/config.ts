import { getProperty } from './environment';

export default {
  localEnvFile: getProperty('PLANKTON_LOCAL_ENV_FILE', 'boot/src/config/local.env'),
};
