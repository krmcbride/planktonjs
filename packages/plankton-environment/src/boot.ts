import appRootPath from 'app-root-path';
import dotenv from 'dotenv';
import config from './config';

// The local.env file should be on the .gitignore in each project and only used for setting
// local overrides of regular development config.
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: `${appRootPath}/${config.localEnvFile}` });
}
