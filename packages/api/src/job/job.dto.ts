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

export class SchedulerInfo {
  constructor(value: SchedulerInfo) {
    Object.assign(this, value);
  }

  id: string;
  queue: string;
  pattern: string;
  enabled: boolean;
}
