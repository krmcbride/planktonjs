import { getProperty } from '@krmcbride/plankton-environment';
import { version } from '../package.json';

export default {
  planktonVersion: version,
  projectPath: getProperty('PLANKTON_PROJECT_PATH', '.'),
  modulePath: getProperty('PLANKTON_MODULE_PATH', 'boot/dist/src'),
  staticPaths: getProperty('PLANKTON_STATIC_PATHS', 'app/dist'),
  staticIndexFile: getProperty('PLANKTON_STATIC_INDEX_FILE', 'index.html'),
  staticIndexReqUrl: getProperty('PLANKTON_STATIC_INDEX_REQ_URL', '/'),
  verifier: getProperty('PLANKTON_AUTH_VERIFIER', '') || undefined,
};
