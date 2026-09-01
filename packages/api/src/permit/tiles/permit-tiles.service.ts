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
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
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
    const window = {
      start: range.dateRange.startDate,
      end: range.dateRange.endDate,
    };

    const stale = await this.permitRepository
      .createQueryBuilder('permit')
      .select("date_trunc('hour', permit.createdAt)", 'time')
      .leftJoin(
        PermitTilesEntity,
        'tile',
        "tile.time = date_trunc('hour', permit.createdAt)",
      )
      .where('permit.createdAt >= :start', window)
      .andWhere('permit.createdAt < :end', window)
      .groupBy("date_trunc('hour', permit.createdAt)")
      .addGroupBy('tile.updatedAt')
      .having(
        'tile.updated_at IS NULL OR max(permit.updated_at) > tile.updated_at',
      )
      .getRawMany<{ time: Date }>();

    const immature = await this.tileRepository
      .createQueryBuilder('tile')
      .select('tile.time', 'time')
      .where('tile.time >= :start', window)
      .andWhere('tile.time < :end', window)
      .andWhere('tile.updated_at < tile.time + :period::interval', {
        period: this.reviewPeriod,
      })
      .andWhere('now() >= tile.time + :period::interval', {
        period: this.reviewPeriod,
      })
      .getRawMany<{ time: Date }>();

    const times = new Map<number, Date>();
    const add = (time: Date): void => {
      times.set(time.getTime(), time);
    };

    for (const time of await findMissingOrStaleTiles(
      this.tileRepository,
      range,
    )) {
      add(time);
    }
    for (const row of [...stale, ...immature]) {
      add(new Date(row.time));
    }

    return [...times.values()].sort((a, b) => a.getTime() - b.getTime());
  }

  async updatedAt(manifests: ManifestEntity[]): Promise<Map<number, Date>> {
    if (manifests.length === 0) return new Map();

    const rows = await this.manifestRepository
      .createQueryBuilder('manifest')
      .select('manifest.id', 'id')
      .addSelect('max(tile.updatedAt)', 'updated')
      .innerJoin(
        PermitTilesEntity,
        'tile',
        'tile.time >= manifest.startDate AND tile.time < manifest.endDate',
      )
      .where('manifest.id IN (:...ids)', {
        ids: manifests.map((manifest) => manifest.id),
      })
      .groupBy('manifest.id')
      .getRawMany<{ id: number; updated: Date }>();

    return new Map(rows.map((row) => [row.id, new Date(row.updated)]));
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
        WHERE e.post_id = pv.post_id AND e.action = $3
      )
      AND NOT EXISTS (
        SELECT 1 FROM post_events e
        WHERE e.post_id = pv.post_id
          AND e.action = $4
          AND e.created_at < pv.updated_at + $2::interval
      )
      AND pv.post_id <> ALL($5::int[])
  `;

  private undecidedParams(pending: number[], capturedAt: Date): unknown[] {
    return [
      capturedAt,
      this.reviewPeriod,
      PostEventAction.approved,
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
      // eslint-disable-next-line no-restricted-syntax -- shares one SQL fragment across two statements
      await this.permitRepository.query(
        `
        SELECT pv.post_id AS id, pv.updater_id AS uploader_id, pv.updated_at AS created_at
        ${this.undecidedFrom}
          AND pv.updated_at >= $6
          AND pv.updated_at < $7
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
    const candidates = await this.permitRepository.manager
      .createQueryBuilder(PostVersionEntity, 'pv')
      .select('pv.postId', 'id')
      .addSelect('pv.updaterId', 'uploader_id')
      .addSelect('pv.updatedAt', 'created_at')
      .where('pv.version = 1')
      .andWhere('pv.updatedAt >= :start', { start: range.startDate })
      .andWhere('pv.updatedAt < :end', { end: range.endDate })
      .andWhere('pv.updatedAt < now() - :period::interval', {
        period: this.reviewPeriod,
      })
      .andWhere((qb) => {
        const approved = qb
          .subQuery()
          .select('1')
          .from(PostEventEntity, 'approval')
          .where('approval.postId = pv.postId')
          .andWhere('approval.action = :approved')
          .getQuery();

        return `NOT EXISTS ${approved}`;
      })
      .andWhere((qb) => {
        const deleted = qb
          .subQuery()
          .select('1')
          .from(PostEventEntity, 'deletion')
          .where('deletion.postId = pv.postId')
          .andWhere('deletion.action = :deleted')
          .andWhere('deletion.createdAt < pv.updated_at + :period::interval')
          .getQuery();

        return `NOT EXISTS ${deleted}`;
      })
      .setParameters({
        approved: PostEventAction.approved,
        deleted: PostEventAction.deleted,
      })
      .getRawMany<{ id: number; uploader_id: number; created_at: Date }>();

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
