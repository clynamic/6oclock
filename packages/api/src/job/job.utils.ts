import { Job } from './job.constants';

export class JobCancelledError extends Error {
  constructor(state: string) {
    super(`Job is no longer active (state: ${state})`);
    this.name = 'JobCancelledError';
  }
}

export type ActiveStateCheck = (job: Job) => Promise<string | undefined>;

let checkState: ActiveStateCheck | undefined;

export function setActiveCheck(check: ActiveStateCheck): void {
  checkState = check;
}

export async function ensureActive(job: Job): Promise<void> {
  if (!checkState) return;
  const state = await checkState(job);
  if (state !== 'active') {
    throw new JobCancelledError(state ?? 'unknown');
  }
}
