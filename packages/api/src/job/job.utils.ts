import { Job } from 'bullmq';

export class JobCancelledError extends Error {
  constructor(state: string) {
    super(`Job is no longer active (state: ${state})`);
    this.name = 'JobCancelledError';
  }
}

export async function ensureActive(job: Job): Promise<void> {
  const state = await job.getState();
  if (state !== 'active') {
    throw new JobCancelledError(state);
  }
}
