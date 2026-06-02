import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cacheable } from 'src/app/browser.module';
import {
  DateRange,
  PartialDateRange,
  SeriesCountPoint,
  TimeScale,
  expandInto,
  generateSeriesLastTileCountPoints,
  generateSeriesRecordPoints,
} from 'src/common';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { Repository } from 'typeorm';

import {
  FlagHandling,
  FlagLifecycleEntity,
} from '../lifecycle/flag-lifecycle.entity';
import { FlagHandledPoint, FlagHandledQuery } from './flag-metric.dto';

@Injectable()
export class FlagMetricService {
  constructor(
    @InjectRepository(PostEventEntity)
    private readonly postEventRepository: Repository<PostEventEntity>,
    @InjectRepository(FlagLifecycleEntity)
    private readonly lifecycleRepository: Repository<FlagLifecycleEntity>,
  ) {}

  @Cacheable({
    prefix: 'flag',
    ttl: 5 * 60 * 1000,
    dependencies: [PostEventEntity],
  })
  async pendingSeries(
    partialRange?: PartialDateRange,
  ): Promise<SeriesCountPoint[]> {
    const range = DateRange.fill(partialRange);

    const query = `
      -- The flags table never resolves on deletion, so reconstruct the flagged
      -- state from post events: a post is flagged from flag_created until its
      -- next flag_removed or deleted. approved does not clear a flag.
      WITH relevant AS (
        SELECT
          post_id,
          action,
          created_at,
          LAG(action) OVER (
            PARTITION BY post_id
            ORDER BY created_at, id
          ) AS prev_action
        FROM post_events
        WHERE action IN ('flag_created', 'flag_removed', 'deleted')
          AND post_id IN (
            SELECT post_id FROM post_events WHERE action = 'flag_created'
          )
      ),
      transitions AS (
        -- Count only state changes, so repeat flags on an already-flagged post
        -- do not inflate the balance and a closed post is not closed twice.
        SELECT created_at, 1 AS change
        FROM relevant
        WHERE action = 'flag_created'
          AND prev_action IS DISTINCT FROM 'flag_created'
        UNION ALL
        SELECT created_at, -1 AS change
        FROM relevant
        WHERE action IN ('flag_removed', 'deleted')
          AND prev_action = 'flag_created'
      ),
      initial_count AS (
        -- Floored at zero: flags opened before the synced event history close
        -- without a matching open and would otherwise drive the count negative.
        SELECT GREATEST(COALESCE(SUM(change), 0), 0) AS count
        FROM transitions
        WHERE created_at < $1
      ),
      hour_aggregates AS (
        SELECT date_trunc('hour', created_at) AS hour, SUM(change) AS change
        FROM transitions
        WHERE created_at >= $1 AND created_at < $2
        GROUP BY date_trunc('hour', created_at)
      ),
      hour_series AS (
        SELECT generate_series(
          $1::timestamptz,
          $2::timestamptz - interval '1 hour',
          interval '1 hour'
        ) AS hour
      )
      SELECT
        hour_series.hour AS time,
        GREATEST(
          (SELECT count FROM initial_count) + COALESCE(
            SUM(hour_aggregates.change) OVER (
              ORDER BY hour_series.hour ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ),
            0
          ),
          0
        ) AS count
      FROM hour_series
      LEFT JOIN hour_aggregates ON hour_series.hour = hour_aggregates.hour
      ORDER BY hour_series.hour
    `;

    const result = (await this.postEventRepository.query(query, [
      range.startDate,
      range.endDate,
    ])) as Array<{ time: Date; count: string }>;

    return generateSeriesLastTileCountPoints(
      result.map((row) => new DateRange(expandInto(row.time, TimeScale.Hour))),
      result.map((row) => parseInt(row.count, 10)),
      range,
    );
  }

  @Cacheable({
    prefix: 'flag',
    ttl: 5 * 60 * 1000,
    dependencies: [FlagLifecycleEntity],
  })
  async handled(
    partialRange?: PartialDateRange,
    query?: FlagHandledQuery,
  ): Promise<FlagHandledPoint[]> {
    const range = DateRange.fill(partialRange);

    const episodes = await this.lifecycleRepository.find({
      where: {
        handledAt: range.find(),
        ...query?.where(),
      },
      select: ['handledAt', 'handling'],
    });

    const allKeys = [FlagHandling.removed, FlagHandling.deleted] as const;

    return generateSeriesRecordPoints<Record<FlagHandling, number>>(
      episodes.map((episode) => episode.handledAt!),
      episodes.map((episode) => episode.handling!),
      allKeys,
      range,
    ).map(
      (point) =>
        new FlagHandledPoint({
          removed: point.value[FlagHandling.removed],
          deleted: point.value[FlagHandling.deleted],
          date: point.date,
        }),
    );
  }
}
