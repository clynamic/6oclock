export const JOB_HANDLER_METADATA = 'JOB_HANDLER_METADATA';

export type JobQueue = 'default' | 'tiling';

export const QUEUE_NAMES: JobQueue[] = ['default', 'tiling'];

export const JOB_TIMED_OUT_PREFIX = 'Timed out after';

// pg-boss writes this on expiry.
export const JOB_EXPIRED_MESSAGE = 'job timed out';

// pg-boss nests its message under value.
export interface JobOutput {
  message?: string;
  value?: { message?: string };
}

export const getJobFailure = (output?: JobOutput | null): string | undefined =>
  output?.message ?? output?.value?.message ?? undefined;

export type JobState =
  | 'active'
  | 'waiting'
  | 'delayed'
  | 'completed'
  | 'failed'
  | 'timedOut';

export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
}

export const RECENT_RUNS = 12;
