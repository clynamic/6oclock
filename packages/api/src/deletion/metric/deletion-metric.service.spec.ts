import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { FindManyOptions, FindOptionsWhere, In } from 'typeorm';

import {
  DeletionActivitySummaryQuery,
  DeletionCountSeriesQuery,
} from './deletion-metric.dto';
import { DeletionMetricService } from './deletion-metric.service';

const SYSTEM_USER_ID = 360277;

const event = (partial: Partial<PostEventEntity>): PostEventEntity =>
  new PostEventEntity({
    id: 1,
    creatorId: 1000,
    postId: 1,
    action: PostEventAction.deleted,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    ...partial,
  });

const january = new PartialDateRange({
  startDate: new Date('2024-01-01T00:00:00Z'),
  endDate: new Date('2024-01-08T00:00:00Z'),
  scale: TimeScale.Day,
  timezone: 'UTC',
});

describe('DeletionMetricService', () => {
  let service: DeletionMetricService;
  let find: jest.Mock;

  beforeEach(async () => {
    find = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        DeletionMetricService,
        {
          provide: getRepositoryToken(PostEventEntity),
          useValue: { find },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(DeletionMetricService);
    await CacheManager.getInstance().clear();
  });

  const whereOf = (): FindOptionsWhere<PostEventEntity> =>
    (find.mock.calls[0]![0] as FindManyOptions<PostEventEntity>)
      .where as FindOptionsWhere<PostEventEntity>;

  describe('countSeries', () => {
    it('keeps the automated account in the deletion volume', async () => {
      await service.countSeries(january);

      expect(whereOf()).not.toHaveProperty('creatorId');
    });

    it('reads both deletions and restorations, since the last one decides', async () => {
      await service.countSeries(january);

      expect(whereOf().action).toEqual(
        In([PostEventAction.deleted, PostEventAction.undeleted]),
      );
    });

    it('leaves out a post that was deleted and then restored in the window', async () => {
      find.mockResolvedValue([
        event({
          id: 1,
          postId: 7,
          action: PostEventAction.deleted,
          createdAt: new Date('2024-01-02T00:00:00Z'),
        }),
        event({
          id: 2,
          postId: 7,
          action: PostEventAction.undeleted,
          createdAt: new Date('2024-01-04T00:00:00Z'),
        }),
      ]);

      const series = await service.countSeries(january);

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('counts a post whose last event in the window is a deletion', async () => {
      find.mockResolvedValue([
        event({
          id: 1,
          postId: 8,
          action: PostEventAction.undeleted,
          createdAt: new Date('2024-01-02T00:00:00Z'),
        }),
        event({
          id: 2,
          postId: 8,
          action: PostEventAction.deleted,
          createdAt: new Date('2024-01-04T00:00:00Z'),
        }),
      ]);

      const series = await service.countSeries(january);

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 1, 0, 0, 0]);
    });

    it('counts each post once, however many times it was deleted', async () => {
      find.mockResolvedValue([
        event({
          id: 1,
          postId: 9,
          action: PostEventAction.deleted,
          createdAt: new Date('2024-01-02T00:00:00Z'),
        }),
        event({
          id: 2,
          postId: 9,
          action: PostEventAction.undeleted,
          createdAt: new Date('2024-01-03T00:00:00Z'),
        }),
        event({
          id: 3,
          postId: 9,
          action: PostEventAction.deleted,
          createdAt: new Date('2024-01-05T00:00:00Z'),
        }),
      ]);

      const series = await service.countSeries(january);

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 0, 1, 0, 0]);
    });

    it('narrows to one deleter when asked for one', async () => {
      await service.countSeries(
        january,
        new DeletionCountSeriesQuery({ creatorId: SYSTEM_USER_ID }),
      );

      expect(whereOf().creatorId).toBe(SYSTEM_USER_ID);
    });

    describe('characterised, not specified', () => {
      it('orders by creation ascending, which is what makes the last event win', async () => {
        await service.countSeries(january);

        expect(
          (find.mock.calls[0]![0] as FindManyOptions<PostEventEntity>).order,
        ).toEqual({ createdAt: 'ASC' });
      });
    });
  });

  describe('activitySummary', () => {
    it('collapses every deletion onto one day, keeping only the hour', async () => {
      find.mockResolvedValue([
        event({
          id: 1,
          postId: 1,
          creatorId: 500,
          createdAt: new Date('2024-01-02T09:30:00Z'),
        }),
        event({
          id: 2,
          postId: 2,
          creatorId: 500,
          createdAt: new Date('2024-01-05T09:45:00Z'),
        }),
      ]);

      const series = await service.activitySummary(
        january,
        new DeletionActivitySummaryQuery({ creatorId: 500 }),
      );

      expect(series).toHaveLength(24);
      expect(series[9]!.value).toBe(2);
      expect(
        series.filter((point) => point.value !== 0).map((point) => point.value),
      ).toEqual([2]);
    });

    it('leaves out deletions by anyone other than the deleter asked for', async () => {
      find.mockResolvedValue([
        event({
          id: 1,
          postId: 1,
          creatorId: 500,
          createdAt: new Date('2024-01-02T09:30:00Z'),
        }),
        event({
          id: 2,
          postId: 2,
          creatorId: 501,
          createdAt: new Date('2024-01-02T09:30:00Z'),
        }),
      ]);

      const series = await service.activitySummary(
        january,
        new DeletionActivitySummaryQuery({ creatorId: 500 }),
      );

      expect(series[9]!.value).toBe(1);
    });
  });
});
