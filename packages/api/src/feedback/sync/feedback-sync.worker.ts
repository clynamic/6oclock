import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  GetUserFeedbacksSearchDeleted,
  UserFeedback,
  userFeedbacks,
} from 'src/api/e621';
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
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestService } from 'src/manifest/manifest.service';

import { FeedbackEntity, FeedbackLabelEntity } from '../feedback.entity';
import { FeedbackSyncService } from './feedback-sync.service';

@Injectable()
export class FeedbackSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly feedbackSyncService: FeedbackSyncService,
    private readonly manifestService: ManifestService,
  ) {}

  private readonly logger = new Logger(FeedbackSyncWorker.name);

  @JobHandler({
    id: 'feedbacks/sync',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runFeedbacks(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      ItemType.feedbacks,
      recentlyRange,
    );

    for (let order of orders) {
      const results: UserFeedback[] = [];

      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);

        const { idRange, dateRange } = order;

        logOrderFetch(this.logger, ItemType.feedbacks, order);

        const result = await rateLimit(
          userFeedbacks(
            loopGuard.iter({
              page: 1,
              limit: MAX_API_LIMIT,
              'search[deleted]': GetUserFeedbacksSearchDeleted.included,
              'search[created_at]': dateRange.toE621RangeString(),
              'search[id]': idRange.toE621RangeString(),
            }),
            axiosConfig,
          ),
        );

        results.push(...result);

        const stored = await this.feedbackSyncService.save(
          result.map(
            (feedback) =>
              new FeedbackEntity({
                ...convertKeysToCamelCase(feedback),
                label: new FeedbackLabelEntity(feedback),
              }),
          ),
        );

        logOrderResult(this.logger, ItemType.feedbacks, stored);

        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: ItemType.feedbacks,
          order: order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (exhausted) {
          logContiguityGaps(this.logger, ItemType.feedbacks, results);
          break;
        }
      }
    }

    await this.manifestService.mergeInRange(ItemType.feedbacks, recentlyRange);
  }
}
