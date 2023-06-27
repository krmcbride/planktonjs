import path from 'path';
import appRootPath from 'app-root-path';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import config from './config';

const LOG = LoggerFactory.getLogger('plankton.express.utils');

const moduleExists = (modulePath: string): boolean => {
  LOG.debug('Checking path [%s]', modulePath);
  try {
    require.resolve(modulePath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e; // unexpected errors should kill startup
    }
    return false;
  }
  return true;
};

export const removeTrailingSlashes = (s: string): string => {
  if (s.length && s.lastIndexOf('/') === s.length - 1) {
    return removeTrailingSlashes(s.substring(0, s.length - 1));
  }
  return s;
};

export const removeLeadingSlashes = (s: string): string => {
  if (s.indexOf('/') === 0) {
    return removeLeadingSlashes(s.substring(1));
  }
  return s;
};

export const addLeadingSlash = (s: string): string => {
  if (s.indexOf('/') !== 0) {
    return `/${s}`;
  }
  return s;
};

export const addTrailingSlash = (s: string): string => {
  if (s.length === 0 || s.lastIndexOf('/') !== s.length - 1) {
    return `${s}/`;
  }
  return s;
};

// Convert each segment into /foo so when concatenated we get a predictable /foo/bar/baz
export const buildUriPath = (pathSegments: string[]): string =>
  pathSegments
    .map((pathSegment) => removeTrailingSlashes(addLeadingSlash(removeLeadingSlashes(pathSegment))))
    .join('');

export const getProjectPath = (...parts: string[]): string =>
  path.join(appRootPath.path, config.projectPath, ...parts);

export const tryApplicationModule = async <T>(
  moduleName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defVal: (args: T) => Promise<void> = (_args: T) => Promise.resolve(),
): Promise<(args: T) => Promise<void>> => {
  LOG.debug('Searching for application module [%s]', moduleName);
  const winningPath = [getProjectPath(config.modulePath, moduleName)].find(moduleExists);
  if (winningPath === undefined) {
    LOG.debug('Application module [%s] not found, falling back to default config', moduleName);
    return defVal;
  }
  LOG.info('Loading application module [%s]', moduleName);
  return (await import(winningPath)).default;
};
