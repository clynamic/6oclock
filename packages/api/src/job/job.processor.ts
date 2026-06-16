import { Injectable } from '@nestjs/common';

import { JOB_TIMED_OUT_PREFIX, Job } from './job.constants';
import type { JobHandlerEntry } from './job.discovery';

@Injectable()
export class JobProcessor {
  async process(entry: JobHandlerEntry, job: Job): Promise<void> {
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
      handlerPromise.catch(() => undefined);
    }
  }
}
