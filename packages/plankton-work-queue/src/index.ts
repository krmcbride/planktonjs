import ControlLoop, { ControlLoopOptions, ControlLoopStatus } from './control-loop';
import type ControlLoopContext from './control-loop-context';
import type { PersistentControlLoopContext } from './control-loop-context';
import MongoControlLoopContext, {
  ControlLoopContextMongoDto,
} from './data/mongodb/mongo-control-loop-context';
import MongoWorkQueue, { MongoWorkQueueDto } from './data/mongodb/mongo-work-queue';
import LeaderElectorSidecar from './web/leader-elector-sidecar';
import type WorkQueue from './work-queue';
import WorkQueueConsumer from './work-queue-consumer';
import type WorkQueueJobDetails from './work-queue-job-details';
import WorkQueueJobState from './work-queue-job-state';

const leaderElectorSidecar = new LeaderElectorSidecar();
const leaderControlLoop = new ControlLoop(() => leaderElectorSidecar.update(), {
  name: 'leader-ctl-loop',
  delayMs: 10000,
  initialDelayMs: 5000,
});
const isLeader = (): boolean => leaderElectorSidecar.isLeader();

export {
  ControlLoop,
  ControlLoopOptions,
  ControlLoopStatus,
  ControlLoopContext,
  PersistentControlLoopContext,
  isLeader,
  leaderControlLoop,
  WorkQueue,
  WorkQueueConsumer,
  WorkQueueJobDetails,
  WorkQueueJobState,
  MongoControlLoopContext,
  ControlLoopContextMongoDto,
  MongoWorkQueue,
  MongoWorkQueueDto,
};
