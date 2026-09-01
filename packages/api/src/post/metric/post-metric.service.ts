import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfMonth, sub } from 'date-fns';
import { Cacheable } from 'src/app/browser.module';
import {
  DateRange,
  PartialDateRange,
  SeriesCountPoint,
  TimeScale,
  expandInto,
  generateSeriesLastTileCountPoints,
} from 'src/common';
import { PermitEntity } from 'src/permit/permit.entity';
import { Repository } from 'typeorm';

import { PostReviewEpisodeEntity } from '../review/post-review.entity';
import { PostStatusSummary } from './post-metric.dto';

@Injectable()
export class PostMetricService {
  constructor(
    @InjectRepository(PostReviewEpisodeEntity)
    private readonly episodeRepository: Repository<PostReviewEpisodeEntity>,
    @InjectRepository(PermitEntity)
    private readonly permitRepository: Repository<PermitEntity>,
  ) {}

  /**
   * Posts can only be pending for 30 days after upload.
   * For performance reasons and for issues with sync misalignment (uploads, approvals/deletions, permits),
   * we choose a period of 2 months. 1 month would likely suffice.
   */
  private pendingCutoffDate(range: DateRange) {
    return sub(startOfMonth(range.startDate), { months: 2 });
  }

  @Cacheable({
    prefix: 'post',
    ttl: 5 * 60 * 1000,
    dependencies: [PostReviewEpisodeEntity, PermitEntity],
  })
  async statusSummary(
    partialRange?: PartialDateRange,
  ): Promise<PostStatusSummary> {
    const range = DateRange.fill(partialRange);
    const cutOff = this.pendingCutoffDate(range);

    // eslint-disable-next-line no-restricted-syntax -- CTE chain over generate_series
    const result = await this.episodeRepository.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE exit = 'approved' AND exited_at >= $1 AND exited_at < $2) as approved,
        COUNT(*) FILTER (WHERE exit = 'deleted' AND exited_at >= $1 AND exited_at < $2) as deleted,
        COUNT(*) FILTER (WHERE exited_at IS NULL OR exited_at >= $2) as pending
      FROM post_review_episodes
      WHERE entered_at >= $3
        AND entered_at < $2
        AND (
          entered_at >= $1
          OR exited_at IS NULL
          OR exited_at >= $1
        )
      `,
      [range.startDate, range.endDate, cutOff],
    );

    const permitted = await this.permitRepository.count({
      where: { createdAt: range.find() },
    });

    return new PostStatusSummary({
      approved: parseInt(result[0]?.approved || '0'),
      deleted: parseInt(result[0]?.deleted || '0'),
      pending: parseInt(result[0]?.pending || '0'),
      permitted,
    });
  }

  @Cacheable({
    prefix: 'post',
    ttl: 5 * 60 * 1000,
    dependencies: [PostReviewEpisodeEntity],
  })
  async pendingSeries(
    partialRange?: PartialDateRange,
  ): Promise<SeriesCountPoint[]> {
    const range = DateRange.fill(partialRange);
    const cutOff = this.pendingCutoffDate(range);

    const query = `
      WITH open_before AS (
        SELECT COUNT(*) AS count
        FROM post_review_episodes
        WHERE entered_at >= $3
          AND entered_at < $1
          AND (exited_at IS NULL OR exited_at >= $1)
      ),
      deltas AS (
        SELECT date_trunc('hour', entered_at) AS hour, 1 AS change
        FROM post_review_episodes
        WHERE entered_at >= greatest($1, $3) AND entered_at < $2
        UNION ALL
        SELECT date_trunc('hour', exited_at) AS hour, -1 AS change
        FROM post_review_episodes
        WHERE entered_at >= $3 AND exited_at >= $1 AND exited_at < $2
      ),
      hours AS (
        SELECT generate_series(
          $1::timestamptz,
          $2::timestamptz - interval '1 hour',
          interval '1 hour'
        ) AS hour
      )
      SELECT
        hours.hour AS time,
        (SELECT count FROM open_before)
          + SUM(COALESCE(SUM(deltas.change), 0)) OVER (ORDER BY hours.hour) AS count
      FROM hours
      LEFT JOIN deltas ON deltas.hour = hours.hour
      GROUP BY hours.hour
      ORDER BY hours.hour
    `;

    // eslint-disable-next-line no-restricted-syntax -- CTE chain over generate_series
    const result = (await this.episodeRepository.query(query, [
      range.startDate,
      range.endDate,
      cutOff,
    ])) as Array<{ time: Date; count: string }>;

    return generateSeriesLastTileCountPoints(
      result.map((row) => new DateRange(expandInto(row.time, TimeScale.Hour))),
      result.map((row) => parseInt(row.count, 10)),
      range,
    );
  }
}
