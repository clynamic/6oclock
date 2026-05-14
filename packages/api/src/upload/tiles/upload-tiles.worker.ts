import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';

import { UploadTilesEntity } from './upload-tiles.entity';
import { UploadTilesService } from './upload-tiles.service';

@Injectable()
export class UploadTilesWorker {
  constructor(private readonly uploadTilesService: UploadTilesService) {}

  private readonly logger = new Logger(UploadTilesWorker.name);

  @JobHandler({
    id: 'uploads/tiles',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runTiling(job: Job) {
    const ranges = await this.uploadTilesService.getRanges();

    if (ranges.length === 0) return;

    for (const { dateRange, updatedAt } of ranges) {
      await ensureActive(job);

      const targets = await this.uploadTilesService.findMissing({
        dateRange,
        updatedAt,
      });

      if (targets.length === 0) continue;

      this.logger.log(
        `Generating ${targets.length} tiles for ${dateRange.toE621RangeString()}`,
      );

      await ensureActive(job);

      const tileData = await this.uploadTilesService.generate(targets);

      const tilesToSave = targets.map((time) => {
        const data = tileData.get(time.toISOString());
        return new UploadTilesEntity({
          time,
          count: data?.count ?? 0,
        });
      });

      await this.uploadTilesService.upsert(tilesToSave);
    }
  }
}
