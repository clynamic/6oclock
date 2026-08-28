import { Injectable, Logger } from '@nestjs/common';
import { posts } from 'src/api';
import { MAX_API_LIMIT } from 'src/api/http/params';
import { AuthService } from 'src/auth/auth.service';
import { LoopGuard, TimeScale, rateLimit, startOf } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';

import { PermitTilesService } from './permit-tiles.service';

@Injectable()
export class PermitTilesWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly permitTilesService: PermitTilesService,
  ) {}

  private readonly logger = new Logger(PermitTilesWorker.name);

  @JobHandler({
    id: 'permits/tiles',
    queue: 'tiling',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runTiling(job: Job) {
    const settled = this.reviewPeriodStart();
    const ranges = await this.permitTilesService.getRanges();

    for (const { dateRange, updatedAt } of ranges) {
      await ensureActive(job);

      const targets = (
        await this.permitTilesService.findMissing({ dateRange, updatedAt })
      ).filter((time) => time < settled);

      if (targets.length === 0) continue;

      const written = await this.permitTilesService.derive(targets, []);

      this.logger.log(
        `Derived ${written} permits across ${targets.length} hours in ${dateRange.toE621RangeString()}`,
      );
    }
  }

  @JobHandler({
    id: 'permits/review',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runReviewPeriod(job: Job) {
    const pending = await this.fetchPendingPosts(job);

    const times: Date[] = [];
    for (
      let time = this.reviewPeriodStart();
      time < new Date();
      time = new Date(time.getTime() + 60 * 60 * 1000)
    ) {
      times.push(time);
    }

    const written = await this.permitTilesService.derive(times, pending);

    this.logger.log(
      `Derived ${written} permits across ${pending.length} pending posts`,
    );
  }

  private reviewPeriodStart(): Date {
    return startOf(
      TimeScale.Hour,
      new Date(
        Date.now() -
          this.permitTilesService.reviewPeriodDays * 24 * 60 * 60 * 1000,
      ),
    );
  }

  private async fetchPendingPosts(job: Job): Promise<number[]> {
    const axiosConfig = this.authService.getServerAxiosConfig();
    const loopGuard = new LoopGuard();
    const ids: number[] = [];

    while (true) {
      await ensureActive(job);

      const result = await rateLimit(
        posts(
          loopGuard.iter({
            page: 1,
            limit: MAX_API_LIMIT,
            tags: [
              'status:pending',
              ids.length ? `id:<${Math.min(...ids)}` : '',
            ]
              .filter(Boolean)
              .join(' '),
          }),
          axiosConfig,
        ),
      );

      ids.push(...result.map((post) => post.id));

      if (result.length < MAX_API_LIMIT) return ids;
    }
  }
}
