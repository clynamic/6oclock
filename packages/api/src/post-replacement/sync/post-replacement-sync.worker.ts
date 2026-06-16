import { Injectable, Logger } from '@nestjs/common';
import { PostReplacement, postReplacements } from 'src/api/e621';
import { MAX_API_LIMIT } from 'src/api/http/params';
import { AuthService } from 'src/auth/auth.service';
import {
  DateRange,
  LoopGuard,
  PartialDateRange,
  convertKeysToCamelCase,
  logContiguityGaps,
  logOrderFetch,
  logOrderResult,
  rateLimit,
  resolveWithDate,
} from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestService } from 'src/manifest/manifest.service';

import {
  PostReplacementEntity,
  PostReplacementLabelEntity,
} from '../post-replacement.entity';
import { PostReplacementSyncService } from './post-replacement-sync.service';

@Injectable()
export class PostReplacementSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly postReplacementSyncService: PostReplacementSyncService,
    private readonly manifestService: ManifestService,
  ) {}

  private readonly logger = new Logger(PostReplacementSyncWorker.name);

  @JobHandler({
    id: 'postReplacements/orders',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runOrders(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      ItemType.postReplacements,
      recentlyRange,
    );

    for (let order of orders) {
      const results: PostReplacement[] = [];
      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);

        const { idRange, dateRange } = order;

        logOrderFetch(this.logger, ItemType.postReplacements, order);

        const result = await rateLimit(
          postReplacements(
            loopGuard.iter({
              page: 1,
              limit: MAX_API_LIMIT,
              'search[created_at]': dateRange.toE621RangeString(),
              'search[id]': idRange.toE621RangeString(),
              'search[order]': 'id',
            }),
            axiosConfig,
          ),
        );

        results.push(...result);

        const stored = await this.postReplacementSyncService.save(
          result.map(
            (replacement) =>
              new PostReplacementEntity({
                ...convertKeysToCamelCase(replacement),
                label: new PostReplacementLabelEntity(replacement),
              }),
          ),
        );

        logOrderResult(this.logger, ItemType.postReplacements, stored);

        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: ItemType.postReplacements,
          order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (exhausted) {
          logContiguityGaps(this.logger, ItemType.postReplacements, stored);
          break;
        }
      }
    }

    await this.manifestService.mergeInRange(
      ItemType.postReplacements,
      recentlyRange,
    );
  }

  @JobHandler({
    id: 'postReplacements/refresh',
    queue: 'default',
    pattern: '*/5 * * * *',
  })
  async runRefresh(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const manifests = await this.manifestService.list(undefined, {
      type: [ItemType.postReplacements],
    });

    for (const manifest of manifests) {
      let refreshDate = manifest.refreshedAt;

      if (!refreshDate) {
        refreshDate = resolveWithDate(
          (await this.postReplacementSyncService.firstFromId(
            manifest.lowerId,
          )) ?? undefined,
        );
      }

      if (!refreshDate) continue;

      const now = new Date();
      const loopGuard = new LoopGuard();
      let page = 1;

      while (true) {
        await ensureActive(job);

        const rangeString = new PartialDateRange({
          startDate: refreshDate,
        }).toE621RangeString();
        const idString = manifest.idRange.toE621RangeString();

        this.logger.log(
          `Fetching post replacements for refresh date ${rangeString} with ids ${idString}`,
        );

        const result = await rateLimit(
          postReplacements(
            loopGuard.iter({
              page,
              limit: MAX_API_LIMIT,
              'search[updated_at]': rangeString,
              'search[id]': idString,
              'search[order]': 'id',
            }),
            axiosConfig,
          ),
        );

        const updated = await this.postReplacementSyncService.countUpdated(
          result.map(convertKeysToCamelCase),
        );

        await this.postReplacementSyncService.save(
          result.map(
            (replacement) =>
              new PostReplacementEntity({
                ...convertKeysToCamelCase(replacement),
                label: new PostReplacementLabelEntity(replacement),
              }),
          ),
        );

        this.logger.log(`Found ${updated} updated post replacements`);

        const exhausted = result.length < MAX_API_LIMIT;

        if (exhausted) break;

        page++;
      }

      await this.manifestService.save({
        id: manifest.id,
        refreshedAt: now,
      });
    }
  }
}
