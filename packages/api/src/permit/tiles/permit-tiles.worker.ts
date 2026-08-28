import { Injectable, Logger } from '@nestjs/common';
import { posts } from 'src/api';
import { MAX_API_LIMIT } from 'src/api/http/params';
import { AuthService } from 'src/auth/auth.service';
import {
  LoopGuard,
  TimeScale,
  chunkDateRange,
  groupTimesIntoRanges,
  rateLimit,
  startOf,
} from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';

import { PermitTilesService } from './permit-tiles.service';

const CHUNK_HOURS = 30;

@Injectable()
export class PermitTilesWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly permitTilesService: PermitTilesService,
  ) {}

  private readonly logger = new Logger(PermitTilesWorker.name);

  @JobHandler({
    id: 'permits/tiles',
    description:
      'Derives permits for hours past the review period and counts them into hourly tiles.',
    queue: 'tiling',
    pattern: '*/3 * * * *',
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

      const written = await this.permitTilesService.derive(targets);

      this.logger.log({
        msg: 'Derived {count} permits across {hours} hours in {range}',
        count: written,
        hours: targets.length,
        range: { start: dateRange.startDate, end: dateRange.endDate },
      });
    }
  }

  @JobHandler({
    id: 'permits/review',
    description:
      'Captures the pending queue and decides the permits inside the review period.',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runReviewPeriod(job: Job) {
    const capturedAt = new Date();
    const pending = await this.fetchPendingPosts(job);
    const settled = this.reviewPeriodStart();

    for (const {
      dateRange,
      updatedAt,
    } of await this.permitTilesService.getRanges()) {
      await ensureActive(job);

      const targets = (
        await this.permitTilesService.findMissing({ dateRange, updatedAt })
      ).filter((time) => time >= settled);

      if (targets.length === 0) continue;

      for (const range of groupTimesIntoRanges(targets)) {
        for (const chunk of chunkDateRange(range, CHUNK_HOURS)) {
          await ensureActive(job);

          const written = await this.permitTilesService.decide(
            chunk,
            pending,
            capturedAt,
          );

          await this.permitTilesService.tile(
            targets.filter(
              (time) => time >= chunk.startDate && time < chunk.endDate,
            ),
          );

          this.logger.log({
            msg: 'Decided {count} permits against {pending} pending posts in {range}',
            count: written,
            pending: pending.length,
            range: { start: chunk.startDate, end: chunk.endDate },
          });
        }
      }
    }
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
