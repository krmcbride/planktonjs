import os from 'os';
import fetch from 'node-fetch';
import { LoggerFactory } from '@krmcbride/plankton-logger';

const LOG = LoggerFactory.getLogger('plankton.workQueue.leaderElectorSidecar');
const HOSTNAME = os.hostname();
const SIDECAR_URL = 'http://127.0.0.1:4040';

/**
 * @see https://github.com/kubernetes-retired/contrib/tree/master/election
 */
export default class LeaderElectorSidecar {
  private leaderInternal = false;

  public constructor() {
    LOG.debug('hostname is %s', HOSTNAME);
  }

  public isLeader(): boolean {
    return this.leaderInternal;
  }

  public update(): Promise<void> {
    LOG.debug('Checking sidecar for current leader');
    return fetch(SIDECAR_URL)
      .then((res) => res.json())
      .then((body) => (body as { name: string }).name)
      .then((name): void => {
        const isLeader = name === HOSTNAME;
        if (this.leaderInternal !== isLeader) {
          LOG.info('Leadership change: %s leader', isLeader ? 'we are now' : `${name} is now`);
        } else {
          LOG.debug('Leader is "%s", we are "%s"', name, HOSTNAME);
        }
        this.leaderInternal = isLeader;
        return undefined;
      })
      .catch((err): void => {
        LOG.warn(err, 'Request failed, returning isLeader=false');
        return undefined;
      });
  }
}
