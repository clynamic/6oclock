import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  GetPostVersionsSearchUploads,
  PostVersion,
  postVersions,
} from 'src/api/e621';
import { MAX_API_LIMIT } from 'src/api/http/params';
import { AuthService } from 'src/auth/auth.service';
import {
  DateRange,
  LoopGuard,
  convertKeysToCamelCase,
  logOrderFetch,
  logOrderResult,
  rateLimit,
} from 'src/common';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestService } from 'src/manifest/manifest.service';
import {
  PostVersionEntity,
  PostVersionLabelEntity,
} from 'src/post-version/post-version.entity';
import {
  NotabilityType,
  NotableUserEntity,
} from 'src/user/notable-user.entity';
import { UserSyncService } from 'src/user/sync/user-sync.service';

import { UploadSyncService } from './upload-sync.service';

@Injectable()
export class UploadSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly uploadSyncService: UploadSyncService,
    private readonly manifestService: ManifestService,
    private readonly userSyncService: UserSyncService,
  ) {}

  private readonly logger = new Logger(UploadSyncWorker.name);

  @JobHandler({
    id: 'uploads/orders',
    queue: 'default',
    pattern: '*/5 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runOrders(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const recentlyRange = DateRange.recentMonths();

    const orders = await this.manifestService.listOrdersByRange(
      ItemType.postVersions,
      recentlyRange,
    );

    for (let order of orders) {
      const results: PostVersion[] = [];
      const loopGuard = new LoopGuard();
      const inPast = order.inPast;

      while (true) {
        await ensureActive(job);

        const { idRange, dateRange } = order;

        logOrderFetch(this.logger, ItemType.postVersions, order);

        const result = await rateLimit(
          postVersions(
            loopGuard.iter({
              page: 1,
              limit: MAX_API_LIMIT,
              'search[uploads]': GetPostVersionsSearchUploads.only,
              'search[updated_at]': dateRange.toE621RangeString(),
              'search[id]': idRange.toE621RangeString(),
              'search[order]': 'id',
            }),
            axiosConfig,
          ),
        );

        results.push(...result);

        const stored = await this.uploadSyncService.save(
          result.map(
            (postVersion) =>
              new PostVersionEntity({
                ...convertKeysToCamelCase(postVersion),
                label: new PostVersionLabelEntity(postVersion),
              }),
          ),
        );

        logOrderResult(this.logger, ItemType.postVersions, stored);

        const exhausted = result.length < MAX_API_LIMIT;

        order = await this.manifestService.saveResults({
          type: ItemType.postVersions,
          order,
          items: stored,
          bottom: exhausted,
          top: inPast,
        });

        if (exhausted) {
          // This sync is porous and always has gaps.
          // logContiguityGaps(this.logger, ItemType.postVersions, results);
          break;
        }
      }
    }

    await this.manifestService.mergeInRange(
      ItemType.postVersions,
      recentlyRange,
    );
  }

  @JobHandler({
    id: 'uploads/notable',
    queue: 'default',
    pattern: '*/10 * * * *',
  })
  async writeNotable(_job: Job): Promise<void> {
    const reporters = await this.uploadSyncService.findUploaders();

    await this.userSyncService.note(
      reporters.map(
        (reporter) =>
          new NotableUserEntity({
            id: reporter,
            type: NotabilityType.uploader,
          }),
      ),
    );

    this.logger.log(`Noted ${reporters.length} uploaders`);
  }
}
