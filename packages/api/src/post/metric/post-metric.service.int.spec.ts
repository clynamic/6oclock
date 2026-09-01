import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { LabelEntity } from 'src/label/label.entity';
import { PermitEntity } from 'src/permit/permit.entity';
import { createTestDatabase } from 'src/testing/postgres';
import { Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import {
  PostReviewEpisodeEntity,
  PostReviewExit,
} from '../review/post-review.entity';
import { PostMetricService } from './post-metric.service';

const at = (iso: string): Date => new Date(iso);

const hourly = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Hour,
    timezone: 'UTC',
  });

const countAt = (
  series: { date: Date; value: number }[],
  iso: string,
): number => {
  const point = series.find(
    (entry) => entry.date.getTime() === at(iso).getTime(),
  );
  if (!point) {
    throw new Error(`No point at ${iso} in ${series.length} points`);
  }
  return point.value;
};

describe('PostMetricService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: PostMetricService;
  let episodes: Repository<PostReviewEpisodeEntity>;
  let permits: Repository<PermitEntity>;

  const episode = (
    postId: number,
    enteredIso: string,
    exitedIso?: string,
    exit?: PostReviewExit,
  ): Promise<unknown> =>
    episodes.insert({
      postId,
      enteredAt: at(enteredIso),
      exitedAt: exitedIso ? at(exitedIso) : null,
      exit: exit ?? null,
    });

  beforeAll(async () => {
    const database = await createTestDatabase('six_oclock_test_post_metric');

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          ...database,
          entities: [PostReviewEpisodeEntity, PermitEntity, LabelEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([PostReviewEpisodeEntity, PermitEntity]),
      ],
      providers: [CacheManager, PostMetricService],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PostMetricService);
    episodes = moduleRef.get(getRepositoryToken(PostReviewEpisodeEntity));
    permits = moduleRef.get(getRepositoryToken(PermitEntity));
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  }, 60000);

  beforeEach(async () => {
    await episodes.clear();
    await permits.clear();
    await CacheManager.getInstance().clear();
  });

  describe('pendingSeries', () => {
    it('holds a post in review from the hour it entered', async () => {
      await episode(1, '2024-02-01T01:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-02-01T00:00:00Z', '2024-02-01T06:00:00Z'),
      );

      expect(countAt(series, '2024-02-01T00:00:00Z')).toBe(0);
      expect(countAt(series, '2024-02-01T01:00:00Z')).toBe(1);
      expect(countAt(series, '2024-02-01T05:00:00Z')).toBe(1);
    });

    it('drops a post from the hour it was approved', async () => {
      await episode(
        2,
        '2024-03-01T01:00:00Z',
        '2024-03-01T03:00:00Z',
        PostReviewExit.approved,
      );

      const series = await service.pendingSeries(
        hourly('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
      );

      expect(countAt(series, '2024-03-01T02:00:00Z')).toBe(1);
      expect(countAt(series, '2024-03-01T03:00:00Z')).toBe(0);
    });

    it('drops a post from the hour it was deleted', async () => {
      await episode(
        3,
        '2024-04-01T01:00:00Z',
        '2024-04-01T03:00:00Z',
        PostReviewExit.deleted,
      );

      const series = await service.pendingSeries(
        hourly('2024-04-01T00:00:00Z', '2024-04-01T06:00:00Z'),
      );

      expect(countAt(series, '2024-04-01T02:00:00Z')).toBe(1);
      expect(countAt(series, '2024-04-01T03:00:00Z')).toBe(0);
    });

    it('carries in a post that entered before the window and has not left', async () => {
      await episode(5, '2024-06-20T00:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-06-25T00:00:00Z', '2024-06-25T06:00:00Z'),
      );

      expect(countAt(series, '2024-06-25T00:00:00Z')).toBe(1);
      expect(countAt(series, '2024-06-25T05:00:00Z')).toBe(1);
    });

    it('drops a post that entered before the pending cutoff', async () => {
      await episode(6, '2024-03-15T00:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-07-01T00:00:00Z', '2024-07-01T06:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('keeps a stale open episode out of the series and the summary', async () => {
      await episode(16, '2024-03-15T00:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-07-01T00:00:00Z', '2024-07-01T06:00:00Z'),
      );
      const summary = await service.statusSummary(
        new PartialDateRange({
          startDate: at('2024-07-01T00:00:00Z'),
          endDate: at('2024-08-01T00:00:00Z'),
          timezone: 'UTC',
        }),
      );

      expect(series[0]!.value).toBe(0);
      expect(summary.pending).toBe(0);
    });

    it('keeps a post that left review in an earlier window out of a later one', async () => {
      await episode(
        7,
        '2024-08-01T00:00:00Z',
        '2024-08-05T00:00:00Z',
        PostReviewExit.deleted,
      );

      const series = await service.pendingSeries(
        hourly('2024-09-01T00:00:00Z', '2024-09-01T06:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('places an entry inside an hour at the top of that hour', async () => {
      await episode(9, '2024-09-15T01:30:00Z');

      const series = await service.pendingSeries(
        hourly('2024-09-15T00:00:00Z', '2024-09-15T04:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 1, 1]);
    });

    it('counts a second spell separately from the first', async () => {
      await episode(
        8,
        '2024-10-01T01:00:00Z',
        '2024-10-01T02:00:00Z',
        PostReviewExit.approved,
      );
      await episode(8, '2024-10-01T04:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-10-01T00:00:00Z', '2024-10-01T06:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 0, 0, 1, 1]);
    });
  });

  describe('statusSummary', () => {
    it('counts each way out of review under its own name', async () => {
      await episode(
        10,
        '2024-11-02T00:00:00Z',
        '2024-11-03T00:00:00Z',
        PostReviewExit.approved,
      );
      await episode(
        11,
        '2024-11-02T00:00:00Z',
        '2024-11-03T00:00:00Z',
        PostReviewExit.approved,
      );
      await episode(
        12,
        '2024-11-02T00:00:00Z',
        '2024-11-04T00:00:00Z',
        PostReviewExit.approved,
      );
      await episode(
        13,
        '2024-11-02T00:00:00Z',
        '2024-11-04T00:00:00Z',
        PostReviewExit.deleted,
      );
      await episode(14, '2024-11-02T00:00:00Z');
      await episode(15, '2024-11-02T00:00:00Z');

      const summary = await service.statusSummary(
        new PartialDateRange({
          startDate: at('2024-11-01T00:00:00Z'),
          endDate: at('2024-12-01T00:00:00Z'),
          timezone: 'UTC',
        }),
      );

      expect(summary).toEqual({
        approved: 3,
        deleted: 1,
        pending: 2,
        permitted: 0,
      });
    });

    it('counts permits from the permits table rather than from review', async () => {
      await permits.insert({
        id: 20,
        uploaderId: 1,
        createdAt: at('2024-12-02T00:00:00Z'),
      });

      const summary = await service.statusSummary(
        new PartialDateRange({
          startDate: at('2024-12-01T00:00:00Z'),
          endDate: at('2025-01-01T00:00:00Z'),
          timezone: 'UTC',
        }),
      );

      expect(summary.permitted).toBe(1);
      expect(summary.pending).toBe(0);
      expect(summary.approved).toBe(0);
    });

    it('leaves a permit granted outside the window out of the count', async () => {
      await permits.insert({
        id: 21,
        uploaderId: 1,
        createdAt: at('2025-03-02T00:00:00Z'),
      });

      const summary = await service.statusSummary(
        new PartialDateRange({
          startDate: at('2025-02-01T00:00:00Z'),
          endDate: at('2025-03-01T00:00:00Z'),
          timezone: 'UTC',
        }),
      );

      expect(summary.permitted).toBe(0);
    });

    it('counts a post that left review outside the window in neither outcome', async () => {
      await episode(
        30,
        '2025-04-02T00:00:00Z',
        '2025-05-15T00:00:00Z',
        PostReviewExit.approved,
      );

      const summary = await service.statusSummary(
        new PartialDateRange({
          startDate: at('2025-04-01T00:00:00Z'),
          endDate: at('2025-05-01T00:00:00Z'),
          timezone: 'UTC',
        }),
      );

      expect(summary.approved).toBe(0);
      expect(summary.pending).toBe(1);
    });
  });
});
