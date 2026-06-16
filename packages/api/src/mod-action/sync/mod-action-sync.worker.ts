import { Injectable, Logger } from '@nestjs/common';
import { ModAction, modActions } from 'src/api/e621';
import { MAX_API_LIMIT } from 'src/api/http/params';
import { AuthService } from 'src/auth/auth.service';
import {
  DateRange,
  LoopGuard,
  convertKeysToCamelCase,
  logContiguityGaps,
  logOrderFetch,
  logOrderResult,
  rateLimit,
} from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestService } from 'src/manifest/manifest.service';

import { ModActionEntity, ModActionLabelEntity } from '../mod-action.entity';
import { ModActionSyncService } from './mod-action-sync.service';

@Injectable()
export class ModActionSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly modActionSyncService: ModActionSyncService,
    private readonly manifestService: ManifestService,
  ) {}

  private readonly logger = new Logger(ModActionSyncWorker.name);

  @JobHandler({
    id: 'modActions/orders',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runOrders(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      ItemType.modActions,
      recentlyRange,
    );

    for (let order of orders) {
      const results: ModAction[] = [];
      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);

        const { idRange, dateRange } = order;

        logOrderFetch(this.logger, ItemType.modActions, order);

        const result = await rateLimit(
          modActions(
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

        const stored = await this.modActionSyncService.save(
          result.map(
            (action) =>
              new ModActionEntity({
                ...convertKeysToCamelCase(action),
                label: new ModActionLabelEntity(action),
              }),
          ),
        );

        logOrderResult(this.logger, ItemType.modActions, stored);

        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: ItemType.modActions,
          order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (exhausted) {
          // Despite not finding any indication of this in the source code,
          // _some_ mod actions are deleted. It is unclear why. Gaps might not indicate an error.
          logContiguityGaps(this.logger, ItemType.modActions, results);
          break;
        }
      }
    }

    await this.manifestService.mergeInRange(ItemType.modActions, recentlyRange);
  }
}
