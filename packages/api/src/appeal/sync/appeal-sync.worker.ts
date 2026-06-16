import { Injectable, Logger } from '@nestjs/common';
import { Appeal, appeals } from 'src/api/e621';
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
  NotabilityType,
  NotableUserEntity,
} from 'src/user/notable-user.entity';
import { UserSyncService } from 'src/user/sync/user-sync.service';

import { AppealEntity, AppealLabelEntity } from '../appeal.entity';
import { AppealSyncService } from './appeal-sync.service';

@Injectable()
export class AppealSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly appealSyncService: AppealSyncService,
    private readonly userSyncService: UserSyncService,
    private readonly manifestService: ManifestService,
  ) {}

  private readonly logger = new Logger(AppealSyncWorker.name);

  @JobHandler({
    id: 'appeals/orders',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runOrders(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      ItemType.appeals,
      recentlyRange,
    );

    for (let order of orders) {
      const results: Appeal[] = [];
      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);

        const { idRange, dateRange } = order;

        logOrderFetch(this.logger, ItemType.appeals, order);

        const result = await rateLimit(
          appeals(
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

        const stored = await this.appealSyncService.save(
          result.map(
            (appeal) =>
              new AppealEntity({
                ...convertKeysToCamelCase(appeal),
                label: new AppealLabelEntity(appeal),
              }),
          ),
        );

        logOrderResult(this.logger, ItemType.appeals, stored);

        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: ItemType.appeals,
          order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (exhausted) {
          logContiguityGaps(this.logger, ItemType.appeals, results);
          break;
        }
      }
    }

    await this.manifestService.mergeInRange(ItemType.appeals, recentlyRange);
  }

  @JobHandler({
    id: 'appeals/refresh',
    queue: 'default',
    pattern: '*/5 * * * *',
  })
  async runRefresh(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const manifests = await this.manifestService.list(undefined, {
      type: [ItemType.appeals],
    });

    for (const manifest of manifests) {
      let refreshDate = manifest.refreshedAt;

      if (!refreshDate) {
        refreshDate = resolveWithDate(
          (await this.appealSyncService.firstFromId(manifest.lowerId)) ??
            undefined,
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
          `Fetching appeals for refresh date ${rangeString} with ids ${idString}`,
        );

        const result = await rateLimit(
          appeals(
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

        const updated = await this.appealSyncService.countUpdated(
          result.map(convertKeysToCamelCase),
        );

        await this.appealSyncService.save(
          result.map(
            (appeal) =>
              new AppealEntity({
                ...convertKeysToCamelCase(appeal),
                label: new AppealLabelEntity(appeal),
              }),
          ),
        );

        this.logger.log(`Found ${updated} updated appeals`);

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

  @JobHandler({
    id: 'appeals/notable',
    queue: 'default',
    pattern: '*/10 * * * *',
  })
  async writeNotable(_job: Job): Promise<void> {
    const appellants = await this.appealSyncService.findAppellants();

    await this.userSyncService.note(
      appellants.map(
        (appellant) =>
          new NotableUserEntity({
            id: appellant,
            type: NotabilityType.appellant,
          }),
      ),
    );

    this.logger.log(`Noted ${appellants.length} appellants`);
  }
}
