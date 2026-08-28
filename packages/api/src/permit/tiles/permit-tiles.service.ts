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

import { PermitEntity, PermitLabelEntity } from '../permit.entity';
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
    const stale: { time: Date }[] = await this.tileRepository.query(
      `
      SELECT date_trunc('hour', permit.created_at) AS time
      FROM permits permit
      LEFT JOIN ${this.tileRepository.metadata.tableName} tile
        ON tile.time = date_trunc('hour', permit.created_at)
      WHERE permit.created_at >= $1 AND permit.created_at < $2
      GROUP BY 1, tile.updated_at
      HAVING tile.updated_at IS NULL OR max(permit.updated_at) > tile.updated_at
      `,
      [range.dateRange.startDate, range.dateRange.endDate],
    );

    const times = new Map<number, Date>();
    for (const time of await findMissingOrStaleTiles(
      this.tileRepository,
      range,
    )) {
      times.set(time.getTime(), time);
    }
    for (const row of stale) {
      times.set(new Date(row.time).getTime(), new Date(row.time));
    }

    return [...times.values()].sort((a, b) => a.getTime() - b.getTime());
  }

  private readonly undecidedFrom = `
    FROM post_versions pv
    WHERE pv.version = 1
      AND pv.updated_at >= $1::timestamptz - $2::interval
      AND pv.updated_at <= $1
      AND NOT EXISTS (
        SELECT 1 FROM permits p WHERE p.id = pv.post_id
      )
      AND NOT EXISTS (
        SELECT 1 FROM post_events e
        WHERE e.post_id = pv.post_id AND e.action IN ($3, $4)
      )
      AND NOT EXISTS (
        SELECT 1 FROM post_events e
        WHERE e.post_id = pv.post_id
          AND e.action = $5
          AND e.created_at < pv.updated_at + $2::interval
      )
      AND pv.post_id <> ALL($6::int[])
  `;

  private undecidedParams(pending: number[], capturedAt: Date): unknown[] {
    return [
      capturedAt,
      this.reviewPeriod,
      PostEventAction.approved,
      PostEventAction.unapproved,
      PostEventAction.deleted,
      pending,
    ];
  }

  @Invalidates([PermitEntity, PermitTilesEntity])
  async decide(
    range: DateRange,
    pending: number[],
    capturedAt: Date,
  ): Promise<number> {
    const candidates: { id: number; uploader_id: number; created_at: Date }[] =
      await this.permitRepository.query(
        `
        SELECT pv.post_id AS id, pv.updater_id AS uploader_id, pv.updated_at AS created_at
        ${this.undecidedFrom}
          AND pv.updated_at >= $7
          AND pv.updated_at < $8
        `,
        [
          ...this.undecidedParams(pending, capturedAt),
          range.startDate,
          range.endDate,
        ],
      );

    if (candidates.length === 0) return 0;

    await this.permitRepository.save(
      candidates.map(
        (candidate) =>
          new PermitEntity({
            id: candidate.id,
            uploaderId: candidate.uploader_id,
            createdAt: candidate.created_at,
            label: new PermitLabelEntity(candidate.id),
          }),
      ),
    );

    return candidates.length;
  }

  @Invalidates([PermitEntity, PermitTilesEntity])
  async derive(times: Date[]): Promise<number> {
    if (times.length === 0) return 0;

    let written = 0;

    for (const range of groupTimesIntoRanges(times)) {
      written += await this.deriveRange(range);
    }

    await this.tile(times);

    return written;
  }

  private async deriveRange(range: DateRange): Promise<number> {
    const candidates: { id: number; uploader_id: number; created_at: Date }[] =
      await this.permitRepository.query(
        `
        SELECT pv.post_id AS id, pv.updater_id AS uploader_id, pv.updated_at AS created_at
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
          AND pv.updated_at < now() - $6::interval
        `,
        [
          range.startDate,
          range.endDate,
          PostEventAction.approved,
          PostEventAction.unapproved,
          PostEventAction.deleted,
          this.reviewPeriod,
        ],
      );

    await this.permitRepository.delete({ createdAt: range.find() });

    await this.permitRepository.save(
      candidates.map(
        (candidate) =>
          new PermitEntity({
            id: candidate.id,
            uploaderId: candidate.uploader_id,
            createdAt: candidate.created_at,
            label: new PermitLabelEntity(candidate.id),
          }),
      ),
    );

    return candidates.length;
  }

  @Invalidates(PermitTilesEntity)
  async tile(times: Date[]): Promise<void> {
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
