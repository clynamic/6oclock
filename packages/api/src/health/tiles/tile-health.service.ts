import { Injectable } from '@nestjs/common';
import { Cacheable } from 'src/app/browser.module';
import {
  CursorParams,
  DateRange,
  PartialDateRange,
  TileService,
  TileType,
} from 'src/common';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PermitTilesEntity } from 'src/permit/tiles/permit-tiles.entity';
import { PermitTilesService } from 'src/permit/tiles/permit-tiles.service';
import { UploadTilesEntity } from 'src/upload/tiles/upload-tiles.entity';
import { UploadTilesService } from 'src/upload/tiles/upload-tiles.service';

import { TileHealth } from './tile-health.dto';
import { readTileMonths, readTileSlices } from './tile-health.utils';

@Injectable()
export class TileHealthService {
  constructor(
    private readonly uploadTilesService: UploadTilesService,
    private readonly permitTilesService: PermitTilesService,
  ) {}

  private tileServices: Partial<Record<TileType, TileService>> = {
    [TileType.uploadHourly]: this.uploadTilesService,
    [TileType.permitHourly]: this.permitTilesService,
  };

  @Cacheable({
    prefix: 'tile-health',
    ttl: 60 * 1000,
    dependencies: [ManifestEntity, UploadTilesEntity, PermitTilesEntity],
  })
  async tiles(
    cursor?: CursorParams,
    range?: PartialDateRange,
  ): Promise<TileHealth[]> {
    const gathered: {
      type: TileType;
      interval: number;
      ranges: number;
      spans: { startDate: Date; endDate: Date }[];
      missing: Date[];
      expected: number;
    }[] = [];

    for (const [type, service] of Object.entries(this.tileServices)) {
      if (!service) continue;

      const ranges = await service.getRanges();
      if (ranges.length === 0) continue;

      const missing: Date[] = [];
      let expected = 0;

      for (const range of ranges) {
        const { startDate, endDate } = range.dateRange;

        expected += Math.ceil(
          (endDate.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * service.interval),
        );

        missing.push(...(await service.findMissing(range)));
      }

      gathered.push({
        type: type as TileType,
        interval: service.interval,
        ranges: ranges.length,
        spans: ranges.map((range) => range.dateRange),
        missing,
        expected,
      });
    }

    const spans = gathered.flatMap((entry) => entry.spans);

    // Marks line up across types only while every strip covers one window.
    const reach = DateRange.spanning(spans) ?? DateRange.recentMonths();

    return gathered
      .map((entry) => {
        const bounds = DateRange.spanning(entry.spans)!;

        return new TileHealth({
          type: entry.type,
          ranges: entry.ranges,
          startDate: bounds.startDate,
          endDate: bounds.endDate,
          expected: entry.expected,
          actual: entry.expected - entry.missing.length,
          slices: readTileSlices({
            ranges: entry.spans,
            missing: entry.missing,
            interval: entry.interval,
            reach,
          }),
          months: readTileMonths({
            ranges: entry.spans,
            missing: entry.missing,
            interval: entry.interval,
            reach,
            before: cursor?.before ? new Date(cursor.before) : undefined,
            limit: cursor?.limit,
            range,
          }),
        });
      })
      .sort((a, b) => a.actual / a.expected - b.actual / b.expected);
  }

  async deleteTilesByType(
    tileType: TileType,
    range?: PartialDateRange,
  ): Promise<void> {
    const service = this.tileServices[tileType];
    if (!service) {
      throw new Error(`No service found for tile type: ${tileType}`);
    }

    await service.wipe(range);
  }
}
