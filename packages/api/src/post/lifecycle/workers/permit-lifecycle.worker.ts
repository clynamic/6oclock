import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateRange, chunkDateRange } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PermitEntity } from 'src/permit/permit.entity';
import { MoreThan, Repository } from 'typeorm';

import { PostLifecycleService } from '../post-lifecycle.service';

@Injectable()
export class PermitLifecycleWorker {
  constructor(
    private readonly lifecycleService: PostLifecycleService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(PermitEntity)
    private readonly permitRepository: Repository<PermitEntity>,
  ) {}

  private readonly logger = new Logger(PermitLifecycleWorker.name);
  // TODO: Persist this across restarts
  private lastProcessedTime: Date | null = null;

  @JobHandler({
    id: 'postLifecycle/permits',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runSync(job: Job) {
    const manifests = await this.manifestRepository.find({
      where: {
        type: ItemType.permits,
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

        const permits = await this.permitRepository.find({
          where: {
            createdAt: chunk.find(),
          },
          select: ['id', 'createdAt'],
        });

        if (permits.length === 0) continue;

        this.logger.log(
          `Syncing ${permits.length} permits for ${chunk.toE621RangeString()}`,
        );

        await this.lifecycleService.upsertPermits(
          permits.map((permit) => ({
            postId: permit.id,
            permittedAt: permit.createdAt,
          })),
        );
      }
    }

    this.lastProcessedTime = new Date();
  }
}
