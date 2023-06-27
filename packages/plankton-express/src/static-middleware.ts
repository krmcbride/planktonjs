import { existsSync } from 'fs';
import path from 'path';
import express, { Application } from 'express';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import config from './config';
import { getProjectPath } from './utils';

const LOG = LoggerFactory.getLogger('plankton.express.staticMiddleware');

// eslint-disable-next-line import/prefer-default-export
export const useStatic = (app: Application) => {
  // Disabling etag at the application level doesn't alter static middleware or sendFile
  const etagSettings =
    app.get('etag') === false
      ? {
          etag: false,
          lastModified: false,
        }
      : {};
  const fqIndexFilePath: string | undefined = config.staticPaths
    .split(',')
    .filter((p) => p !== '')
    .map((staticPath) => getProjectPath(staticPath)) // Fully qualified project path
    .map((fqStaticPath) => {
      LOG.debug('Registering static middleware for path=%j', fqStaticPath);
      app.use(
        express.static(fqStaticPath, {
          ...etagSettings,
          index: false,
        }),
      );
      // Return the fq path if this path has the index file in it
      const fqIndexFilePathMaybe = path.resolve(fqStaticPath, config.staticIndexFile);
      return existsSync(fqIndexFilePathMaybe) ? fqIndexFilePathMaybe : undefined;
    })
    .filter((fqIndexFilePathMaybe) => fqIndexFilePathMaybe !== undefined)[0];
  if (fqIndexFilePath) {
    LOG.debug(
      'Registering %s sendFile middleware with and path=%j',
      config.staticIndexReqUrl,
      fqIndexFilePath,
    );
    app.get(config.staticIndexReqUrl, (_req, res, next) => {
      res.sendFile(fqIndexFilePath, { ...etagSettings }, next);
    });
  }
};
