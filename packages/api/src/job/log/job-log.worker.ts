import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'src/job/job.constants';
import { ensureActive } from 'src/job/job.utils';

import { JobHandler } from '../job.decorator';
import { JobLogService } from './job-log.service';

const PRUNE_CHUNK = 10000;

@Injectable()
export class JobLogWorker {
  constructor(private readonly logService: JobLogService) {}

  private readonly logger = new Logger(JobLogWorker.name);

  @JobHandler({
    id: 'jobs/logs',
    description: 'Clears the log lines of runs past the retention window.',
    queue: 'tiling',
    pattern: '0 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runPrune(job: Job): Promise<void> {
    let cleared = 0;

    for (;;) {
      await ensureActive(job);

      const removed = await this.logService.prune(PRUNE_CHUNK);
      cleared += removed;

      if (removed < PRUNE_CHUNK) break;
    }

    if (cleared) {
      this.logger.log({
        msg: 'Cleared {count} log lines of forgotten runs',
        count: cleared,
      });
    }
  }
}
