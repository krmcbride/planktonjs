import type WorkQueueJobDetails from './work-queue-job-details';
import type WorkQueueJobState from './work-queue-job-state';

export default interface WorkQueue<T extends WorkQueueJobDetails> {
  jobName: string;
  enqueue(jobDetails: T): Promise<string>;
  dequeue(): Promise<{ jobId: string; jobDetails: T } | null>;
  ack(jobId: string, jobResults: unknown): Promise<void>;
  nack(jobId: string, jobResults: unknown): Promise<void>;
  stat(jobId: string): Promise<{
    jobState: WorkQueueJobState;
    jobResults?: Record<string, unknown>;
  } | null>;
}
