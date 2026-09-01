import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cacheable } from 'src/app/browser.module';
import { DateRange } from 'src/common';
import { ItemType, POROUS_ITEM_TYPES } from 'src/label/label.entity';
import { ContiguityGapEntity } from 'src/manifest/gaps/contiguity-gap.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { Repository } from 'typeorm';

import { ManifestHealth } from './manifest-health.dto';
import { SLICE_COUNT, readManifestCoverage } from './manifest-health.utils';

@Injectable()
export class ManifestHealthService {
  constructor(
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(ContiguityGapEntity)
    private readonly gapRepository: Repository<ContiguityGapEntity>,
  ) {}

  private async readGaps(): Promise<Map<ItemType, number>> {
    const rows = await this.gapRepository
      .createQueryBuilder('gap')
      .select('gap.type', 'type')
      .addSelect('SUM(gap.upperId - gap.lowerId + 1)', 'gaps')
      .groupBy('gap.type')
      .getRawMany<{ type: ItemType; gaps: string }>();

    return new Map(rows.map((row) => [row.type, Number(row.gaps)]));
  }

  private async readGapMarks(
    reach: DateRange,
  ): Promise<Map<ItemType, number[]>> {
    const mark = `least(
      :slices::int - 1,
      greatest(0, floor(
        extract(epoch FROM gap.startDate - :reachStart::timestamptz)
        / (extract(epoch FROM :reachEnd::timestamptz - :reachStart::timestamptz) / :slices)
      ))
    )`;

    const rows = await this.gapRepository
      .createQueryBuilder('gap')
      .select('gap.type', 'type')
      .addSelect(mark, 'mark')
      .addSelect('SUM(gap.upperId - gap.lowerId + 1)', 'gaps')
      .groupBy('gap.type')
      .addGroupBy(mark)
      .setParameters({
        reachStart: reach.startDate,
        reachEnd: reach.endDate,
        slices: SLICE_COUNT,
      })
      .getRawMany<{ type: ItemType; mark: string; gaps: string }>();

    const marks = new Map<ItemType, number[]>();

    for (const row of rows) {
      const counts =
        marks.get(row.type) ?? new Array<number>(SLICE_COUNT).fill(0);
      counts[Number(row.mark)] = Number(row.gaps);
      marks.set(row.type, counts);
    }

    return marks;
  }

  @Cacheable({
    prefix: 'manifest-health',
    ttl: 60 * 1000,
    dependencies: [ManifestEntity, ContiguityGapEntity],
  })
  async manifests(): Promise<ManifestHealth[]> {
    const manifests = await this.manifestRepository.find();
    const gaps = await this.readGaps();

    const reach = DateRange.spanning(manifests) ?? DateRange.recentMonths();
    const marks = await this.readGapMarks(reach);

    const byType = new Map<ItemType, ManifestEntity[]>();
    for (const manifest of manifests) {
      const list = byType.get(manifest.type);
      if (list) list.push(manifest);
      else byType.set(manifest.type, [manifest]);
    }

    return [...byType.entries()]
      .map(([type, entries]) => {
        const coverage = readManifestCoverage(entries, reach, marks.get(type));

        return new ManifestHealth({
          type,
          porous: POROUS_ITEM_TYPES.includes(type),
          gaps: gaps.get(type) ?? 0,
          updatedAt: entries.reduce(
            (latest, entry) =>
              entry.updatedAt > latest ? entry.updatedAt : latest,
            entries[0]!.updatedAt,
          ),
          ...coverage,
        });
      })
      .sort((a, b) => a.covered - b.covered);
  }
}
