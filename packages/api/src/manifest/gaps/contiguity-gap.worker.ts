import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { Repository } from 'typeorm';

import { ManifestEntity } from '../manifest.entity';
import { ManifestStampService } from '../stamps/manifest-stamp.service';
import { ContiguityGapEntity } from './contiguity-gap.entity';
import { ContiguityGapService } from './contiguity-gap.service';

@Injectable()
export class ContiguityGapWorker {
  constructor(
    private readonly gapService: ContiguityGapService,
    private readonly stampService: ManifestStampService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
  ) {}

  private readonly logger = new Logger(ContiguityGapWorker.name);

  @JobHandler({
    id: 'manifests/gaps',
    description:
      'Finds the ids missing inside each synced range, for the manifests updated since the last scan.',
    queue: 'tiling',
    pattern: '0 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runScan(job: Job) {
    const manifests = await this.manifestRepository.find();

    const pending = await this.stampService.pending(
      ContiguityGapEntity,
      manifests,
    );

    if (pending.length === 0) return;

    for (const range of this.gapService.rangesOf(manifests, pending)) {
      await ensureActive(job);

      const gaps = await this.gapService.scan(range);

      this.logger.log({
        msg: 'Found {count} gaps in {type} between {lower} and {upper}',
        count: gaps.length,
        type: range.type,
        lower: range.lowerId,
        upper: range.upperId,
      });

      await ensureActive(job);

      await this.gapService.replace(range, gaps);
      await this.stampService.stamp(ContiguityGapEntity, [range.manifestId]);
    }
  }
}
