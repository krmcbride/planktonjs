import 'reflect-metadata';
import '@krmcbride/plankton-environment/dist/src/boot';

import { collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();
// eslint-disable-next-line import/prefer-default-export
export const serverPromise = import('./server').then(({ server }) => server.start());
