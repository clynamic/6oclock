import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { Invalidates } from 'src/app/browser.module';
import { AppConfigKeys } from 'src/app/config.module';
import {
  DateRange,
  PartialDateRange,
  TileService,
  TilingRange,
  findMissingOrStaleTiles,
  getTilingRanges,
  groupTimesIntoRanges,
} from 'src/common';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { Repository } from 'typeorm';

import { PermitEntity } from '../permit.entity';
import { PermitTilesEntity } from './permit-tiles.entity';

// The pruner runs daily, so a post outlives the window.
const PRUNE_SLACK_DAYS = 2;

@Injectable()
export class PermitTilesService implements TileService {
  readonly interval = 1;

  constructor(
    @InjectRepository(PermitTilesEntity)
    private readonly tileRepository: Repository<PermitTilesEntity>,
    @InjectRepository(PermitEntity)
    private readonly permitRepository: Repository<PermitEntity>,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    config: ConfigService,
  ) {
    this.reviewPeriodDays =
      config.getOrThrow<number>(
        AppConfigKeys.E621_UNAPPROVED_POST_DELETION_WINDOW_DAYS,
      ) + PRUNE_SLACK_DAYS;
  }

  readonly reviewPeriodDays: number;

  private get reviewPeriod(): string {
    return `${this.reviewPeriodDays} days`;
  }

  async getRanges(): Promise<TilingRange[]> {
    const types = [ItemType.postVersions, ItemType.postEvents];

    const manifests = await this.manifestRepository.find({
      where: types.map((type) => ({ type })),
    });

    return getTilingRanges(manifests, types);
  }

  async findMissing(range: TilingRange): Promise<Date[]> {
    return findMissingOrStaleTiles(this.tileRepository, range);
  }

  /**
   * Rewrite every permit whose upload falls in the range, and tile the hours.
   *
   * An upload is permitted when nothing approved or unapproved it, nothing
   * deleted it inside the review period, and either it has outlived the review period
   * or e621 does not currently list it as pending. The first two are decided
   * from our own tables at any age. The third is the only question the queue
   * answers, and only for uploads too young to have settled.
   *
   * The range is deleted before it is written, so a rerun of the same range
   * produces the same rows whatever it held before.
   */
  @Invalidates([PermitEntity, PermitTilesEntity])
  async derive(times: Date[], pending: number[]): Promise<number> {
    if (times.length === 0) return 0;

    let written = 0;

    for (const range of groupTimesIntoRanges(times)) {
      written += await this.deriveRange(range, pending);
    }

    await this.tile(times);

    return written;
  }

  private async deriveRange(
    range: DateRange,
    pending: number[],
  ): Promise<number> {
    return this.permitRepository.manager.transaction(async (manager) => {
      await manager.query(
        `DELETE FROM permits WHERE created_at >= $1 AND created_at < $2`,
        [range.startDate, range.endDate],
      );

      const rows: unknown[] = await manager.query(
        `
        INSERT INTO permits (id, uploader_id, created_at, label_id)
        SELECT pv.post_id, pv.updater_id, pv.updated_at, '/permits/' || pv.post_id
        FROM post_versions pv
        WHERE pv.version = 1
          AND pv.updated_at >= $1
          AND pv.updated_at < $2
          AND NOT EXISTS (
            SELECT 1 FROM post_events e
            WHERE e.post_id = pv.post_id AND e.action IN ($3, $4)
          )
          AND NOT EXISTS (
            SELECT 1 FROM post_events e
            WHERE e.post_id = pv.post_id
              AND e.action = $5
              AND e.created_at < pv.updated_at + $6::interval
          )
          AND (
            pv.updated_at < now() - $6::interval
            OR pv.post_id <> ALL($7::int[])
          )
        RETURNING id
        `,
        [
          range.startDate,
          range.endDate,
          PostEventAction.approved,
          PostEventAction.unapproved,
          PostEventAction.deleted,
          this.reviewPeriod,
          pending,
        ],
      );

      return rows.length;
    });
  }

  private async tile(times: Date[]): Promise<void> {
    const counts = new Map<string, number>();

    for (const range of groupTimesIntoRanges(times)) {
      const rows = await this.permitRepository
        .createQueryBuilder('permit')
        .select("date_trunc('hour', permit.created_at)", 'time')
        .addSelect('COUNT(*)', 'count')
        .where('permit.created_at >= :start', { start: range.startDate })
        .andWhere('permit.created_at < :end', { end: range.endDate })
        .groupBy("date_trunc('hour', permit.created_at)")
        .getRawMany<{ time: Date; count: string }>();

      rows.forEach((row) =>
        counts.set(new Date(row.time).toISOString(), parseInt(row.count, 10)),
      );
    }

    await this.upsert(
      times.map(
        (time) =>
          new PermitTilesEntity({
            time,
            count: counts.get(time.toISOString()) ?? 0,
          }),
      ),
    );
  }

  @Invalidates(PermitTilesEntity)
  async upsert(tiles: PermitTilesEntity[]): Promise<void> {
    if (tiles.length === 0) return;

    await this.tileRepository
      .createQueryBuilder()
      .insert()
      .into(PermitTilesEntity)
      .values(tiles)
      .orUpdate(['count', 'updated_at'], ['time'])
      .execute();
  }

  @Invalidates(PermitTilesEntity)
  async wipe(range?: PartialDateRange): Promise<void> {
    if (range?.find()) {
      await this.tileRepository.delete({ time: range.find() });
    } else {
      await this.tileRepository.clear();
    }
  }
}
