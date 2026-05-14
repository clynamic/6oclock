import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { posts } from 'src/api';
import { MAX_API_LIMIT } from 'src/api/http/params';
import { CacheManager } from 'src/app/browser.module';
import { AuthService } from 'src/auth/auth.service';
import {
  DateRange,
  LoopGuard,
  logOrderFetch,
  logOrderResult,
  rateLimit,
} from 'src/common';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestService } from 'src/manifest/manifest.service';

import { PermitEntity, PermitLabelEntity } from '../permit.entity';
import { PermitSyncService } from './permit-sync.service';

@Injectable()
export class PermitSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly permitSyncService: PermitSyncService,
    private readonly manifestService: ManifestService,
    private readonly cacheManager: CacheManager,
  ) {}

  private readonly logger = new Logger(PermitSyncWorker.name);

  @JobHandler({
    id: 'permits/orders',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runOrders(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      ItemType.permits,
      recentlyRange,
    );

    for (let order of orders) {
      const results: PermitEntity[] = [];
      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);

        const { idRange, dateRange } = order;

        logOrderFetch(this.logger, ItemType.permits, order);

        const tagsQuery = [
          'approver:none',
          '-status:pending',
          `date:${dateRange.toE621RangeString()}`,
          !idRange.isEmpty ? `id:${idRange.toE621RangeString()}` : '',
        ]
          .filter(Boolean)
          .join(' ');

        const result = await rateLimit(
          posts(
            loopGuard.iter({
              page: 1,
              limit: MAX_API_LIMIT,
              tags: tagsQuery,
            }),
            axiosConfig,
          ),
        );

        const permits = result.map(
          (post) =>
            new PermitEntity({
              id: post.id,
              uploaderId: post.uploader_id,
              createdAt: new Date(post.created_at),
              label: new PermitLabelEntity(post.id),
            }),
        );

        results.push(...permits);

        const stored = await this.permitSyncService.save(permits);

        logOrderResult(this.logger, ItemType.permits, stored);

        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: ItemType.permits,
          order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (permits.length) {
          this.cacheManager.inv(PermitEntity);
        }

        if (exhausted) {
          // This sync is porous and always has gaps.
          // logContiguityGaps(this.logger, ItemType.permits, results);
          break;
        }
      }
    }
  }

  @JobHandler({
    id: 'permits/cleanup',
    queue: 'default',
    pattern: '*/5 * * * *',
  })
  async runCleanup(_job: Job): Promise<void> {
    const invalidPermits = await this.permitSyncService.findInvalidPermits();

    if (invalidPermits.length > 0) {
      await this.permitSyncService.remove(invalidPermits);
      this.logger.log(`Cleaned up ${invalidPermits.length} invalid permits`);
      this.cacheManager.inv(PermitEntity);
    }
  }
}
