import { Injectable, Logger } from '@nestjs/common';
import { GetTagAliasesSearchOrder, TagAlias, tagAliases } from 'src/api';
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

import { TagAliasEntity, TagAliasLabelEntity } from '../tag-alias.entity';
import { TagAliasSyncService } from './tag-alias-sync.service';

@Injectable()
export class TagAliasSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly tagAliasSyncService: TagAliasSyncService,
    private readonly manifestService: ManifestService,
  ) {}

  private readonly logger = new Logger(TagAliasSyncWorker.name);
  private readonly type = ItemType.tagAliases;

  // @Cron(CronExpression.EVERY_5_MINUTES)
  @JobHandler({
    id: 'tagAliases/orders',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
    enabled: false,
  })
  async runOrders(job: Job) {
    const axiosConfig = this.authService.getServerAxiosConfig();
    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      this.type,
      recentlyRange,
    );

    for (let order of orders) {
      const results: TagAlias[] = [];
      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);
        const { idRange, dateRange } = order;
        logOrderFetch(this.logger, this.type, order);

        const result = await rateLimit(
          tagAliases(
            loopGuard.iter({
              page: 1,
              limit: MAX_API_LIMIT,
              'search[created_at]': dateRange.toE621RangeString(),
              'search[id]': idRange.toE621RangeString(),
              'search[order]': GetTagAliasesSearchOrder.id_desc,
            }),
            axiosConfig,
          ),
        );

        results.push(...result);

        const stored = await this.tagAliasSyncService.save(
          result.map(
            (alias) =>
              new TagAliasEntity({
                ...convertKeysToCamelCase(alias),
                label: new TagAliasLabelEntity(alias),
              }),
          ),
        );

        logOrderResult(this.logger, this.type, stored);
        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: this.type,
          order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (exhausted) {
          logContiguityGaps(this.logger, this.type, results);
          break;
        }
      }
    }
    await this.manifestService.mergeInRange(this.type, recentlyRange);
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  @JobHandler({
    id: 'tagAliases/refresh',
    queue: 'default',
    pattern: '*/5 * * * *',
    enabled: false,
  })
  async runRefresh(job: Job) {
    const axiosConfig = this.authService.getServerAxiosConfig();
    const manifests = await this.manifestService.list(undefined, {
      type: [this.type],
    });

    for (const manifest of manifests) {
      let refreshDate = manifest.refreshedAt;
      if (!refreshDate) {
        refreshDate = resolveWithDate(
          (await this.tagAliasSyncService.firstFromId(manifest.lowerId)) ??
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
          `Fetching tag aliases for refresh date ${rangeString} with ids ${idString}`,
        );

        const result = await rateLimit(
          tagAliases(
            loopGuard.iter({
              page,
              limit: MAX_API_LIMIT,
              'search[updated_at]': rangeString,
              'search[id]': idString,
              'search[order]': GetTagAliasesSearchOrder.id_desc,
            }),
            axiosConfig,
          ),
        );

        const updated = await this.tagAliasSyncService.countUpdated(
          result.map(convertKeysToCamelCase),
        );

        await this.tagAliasSyncService.save(
          result.map(
            (alias) =>
              new TagAliasEntity({
                ...convertKeysToCamelCase(alias),
                label: new TagAliasLabelEntity(alias),
              }),
          ),
        );

        this.logger.log(`Found ${updated} updated tag aliases`);
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
