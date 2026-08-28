import { Injectable } from '@nestjs/common';
import { withLogFields } from 'src/app/logger/log.context';

import { JOB_TIMED_OUT_PREFIX, Job } from './job.constants';
import type { JobHandlerEntry } from './job.discovery';
import { JobLogService } from './log/job-log.service';

@Injectable()
export class JobProcessor {
  constructor(private readonly logService: JobLogService) {}

  async process(entry: JobHandlerEntry, job: Job): Promise<void> {
    const logs = this.logService.collect(job.id);

    try {
      await withLogFields(
        { job: { id: job.id, handler: entry.options.id } },
        () => this.run(entry, job),
      );
    } finally {
      await logs.close();
    }
  }

  private async run(entry: JobHandlerEntry, job: Job): Promise<void> {
    const handlerPromise = entry.handler(job);

    if (!entry.options.timeout) {
      return handlerPromise;
    }

    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            new Error(`${JOB_TIMED_OUT_PREFIX} ${entry.options.timeout}ms`),
          ),
        entry.options.timeout,
      );
    });

    try {
      await Promise.race([handlerPromise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}
