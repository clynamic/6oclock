import { JobState } from './job.constants';

export class JobInfo {
  constructor(value: JobInfo) {
    Object.assign(this, value);
  }

  id: string;
  name: string;
  queue: string;
  state: string;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  failedReason?: string;
}

export class JobQuery {
  constructor(value: JobQuery) {
    Object.assign(this, value);
  }

  handler?: string;
}

export class SchedulerInfo {
  constructor(value: SchedulerInfo) {
    Object.assign(this, value);
  }

  id: string;
  description: string;

  queue: string;
  pattern: string;
  enabled: boolean;
}

export class JobOverview {
  constructor(value: JobOverview) {
    Object.assign(this, value);
  }

  id: string;
  description: string;
  queue: string;
  pattern: string;
  enabled: boolean;

  outcome?: JobState;

  ranAt?: Date;

  ranFor?: number;

  failedReason?: string;

  succeededAt?: Date;

  recent: JobState[];

  errors: number;
}

export class JobLogInfo {
  constructor(value: JobLogInfo) {
    Object.assign(this, value);
  }

  at: Date;
  level: string;
  context?: string;
  message: string;
}
