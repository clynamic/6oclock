import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateRange, chunkDateRange } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { MoreThan, Repository } from 'typeorm';

import { PostLifecycleService } from '../post-lifecycle.service';

@Injectable()
export class UploadLifecycleWorker {
  constructor(
    private readonly lifecycleService: PostLifecycleService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(PostVersionEntity)
    private readonly postVersionRepository: Repository<PostVersionEntity>,
  ) {}

  private readonly logger = new Logger(UploadLifecycleWorker.name);
  // TODO: Persist this across restarts
  private lastProcessedTime: Date | null = null;

  @JobHandler({
    id: 'postLifecycle/uploads',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runSync(job: Job) {
    const manifests = await this.manifestRepository.find({
      where: {
        type: ItemType.postVersions,
        ...(this.lastProcessedTime && {
          updatedAt: MoreThan(this.lastProcessedTime),
        }),
      },
    });

    if (manifests.length === 0) return;

    for (const manifest of manifests) {
      await ensureActive(job);

      const range = new DateRange({
        startDate: manifest.startDate,
        endDate: manifest.endDate,
      });

      const chunks = chunkDateRange(range, 30);

      for (const chunk of chunks) {
        await ensureActive(job);

        const uploads = await this.postVersionRepository.find({
          where: {
            version: 1,
            updatedAt: chunk.find(),
          },
          select: ['postId', 'updatedAt'],
        });

        if (uploads.length === 0) continue;

        this.logger.log(
          `Syncing ${uploads.length} uploads for ${chunk.toE621RangeString()}`,
        );

        await this.lifecycleService.upsertUploads(
          uploads.map((upload) => ({
            postId: upload.postId,
            uploadedAt: upload.updatedAt,
          })),
        );
      }
    }

    this.lastProcessedTime = new Date();
  }
}
