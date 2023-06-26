import appRootPath from 'app-root-path';
import dotenv from 'dotenv';
import config from './config';

// The local.env file should be on the .gitignore in each project and only used for setting
// local overrides of regular development config.
// Normally "override: false", the default, seems like the right thing to do, but things are
// complicated for us. In local development we want to read the local.env and have it stick,
// but when using serverless-offline, the local "dev" stage environment variables will be set
// first and local.env overrides won't be applied, hence the "override: true" below...
// However, if we then try to run integration tests locally and have both a test.env and
// local.env, we're in trouble because local.env will take precedence over test.env (our
// boilerplate jest config loads the test.env last). One approach to fixing that would be to
// have projects themselves use "override: true" when they load their test.env, but that
// prevents the user from being able to provide command line overrides such as:
// MONGODB_URI=foo yarn test-ci
// and instead requires the test.env (which is intended for remote CI testing) be temporarily
// modified. To prevent this, the best option is to not load local.env at all in NODE_ENV=test
// (or in NODE_ENV=production just to be safe, in case a local.env gets committed), which
// leaves the test.env (and possible command line overrides) as the environment source when
// running tests.
// TO SUMMARIZE:
// - When deployed to production, staging, uat, or development, we only want the serverless.yml
//   environment variables to be used
// - When running locally with serverless-offline we want the local.env to override serverless.yml
//   development defaults
// - When CI tests are run in regular build workflows we only want the test.env read
// - When running CI tests locally (for debugging, etc) we want test.env to be read but would like
//   to override that with command line env vars as needed.
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: `${appRootPath}/${config.localEnvFile}`, override: true });
}
