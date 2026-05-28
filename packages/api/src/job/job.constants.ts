export const JOB_HANDLER_METADATA = 'JOB_HANDLER_METADATA';

export type JobQueue = 'default' | 'tiling';

export const QUEUE_NAMES: JobQueue[] = ['default', 'tiling'];

export const JOB_TIMED_OUT_PREFIX = 'Timed out after';

export type JobState =
  | 'active'
  | 'waiting'
  | 'delayed'
  | 'completed'
  | 'failed'
  | 'timedOut';
