import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { LabelEntity } from 'src/label/label.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { createTestDatabase } from 'src/testing/postgres';
import { Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { FlagLifecycleEntity } from '../lifecycle/flag-lifecycle.entity';
import { FlagMetricService } from './flag-metric.service';

const at = (iso: string): Date => new Date(iso);

const hourly = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Hour,
    timezone: 'UTC',
  });

describe('FlagMetricService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: FlagMetricService;
  let events: Repository<PostEventEntity>;
  let nextId = 1;

  const event = (
    postId: number,
    action: PostEventAction,
    iso: string,
  ): Promise<unknown> =>
    events.insert({
      id: nextId++,
      postId,
      creatorId: 500,
      action,
      createdAt: at(iso),
    });

  beforeAll(async () => {
    const database = await createTestDatabase('six_oclock_test_flag');

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          ...database,
          entities: [PostEventEntity, FlagLifecycleEntity, LabelEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([PostEventEntity, FlagLifecycleEntity]),
      ],
      providers: [CacheManager, FlagMetricService],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(FlagMetricService);
    events = moduleRef.get(getRepositoryToken(PostEventEntity));
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  }, 60000);

  beforeEach(async () => {
    await events.clear();
    await CacheManager.getInstance().clear();
  });

  describe('pendingSeries', () => {
    it('holds a post flagged and never handled from the hour it was flagged', async () => {
      await event(1, PostEventAction.flag_created, '2024-02-01T01:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-02-01T00:00:00Z', '2024-02-01T05:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 1, 1, 1]);
    });

    it('clears a flag when it is removed', async () => {
      await event(2, PostEventAction.flag_created, '2024-03-01T01:00:00Z');
      await event(2, PostEventAction.flag_removed, '2024-03-01T03:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-03-01T00:00:00Z', '2024-03-01T05:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 1, 0, 0]);
    });

    it('clears a flag when the post is deleted, which upstream never records', async () => {
      await event(3, PostEventAction.flag_created, '2024-04-01T01:00:00Z');
      await event(3, PostEventAction.deleted, '2024-04-01T03:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-04-01T00:00:00Z', '2024-04-01T05:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 1, 0, 0]);
    });

    it('counts a repeat flag on an already flagged post only once', async () => {
      await event(4, PostEventAction.flag_created, '2024-05-01T01:00:00Z');
      await event(4, PostEventAction.flag_created, '2024-05-01T02:00:00Z');
      await event(4, PostEventAction.flag_removed, '2024-05-01T04:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-05-01T00:00:00Z', '2024-05-01T06:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 1, 1, 0, 0]);
    });

    it('closes a post once, however many ways it was closed', async () => {
      await event(5, PostEventAction.flag_created, '2024-06-01T01:00:00Z');
      await event(5, PostEventAction.flag_removed, '2024-06-01T02:00:00Z');
      await event(5, PostEventAction.deleted, '2024-06-01T03:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-06-01T00:00:00Z', '2024-06-01T05:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 0, 0, 0]);
    });

    it('opens a second flag after the first was handled', async () => {
      await event(6, PostEventAction.flag_created, '2024-07-01T01:00:00Z');
      await event(6, PostEventAction.flag_removed, '2024-07-01T02:00:00Z');
      await event(6, PostEventAction.flag_created, '2024-07-01T03:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-07-01T00:00:00Z', '2024-07-01T05:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 0, 1, 1]);
    });

    it('leaves a post that was never flagged out of the balance entirely', async () => {
      await event(7, PostEventAction.deleted, '2024-08-01T01:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-08-01T00:00:00Z', '2024-08-01T04:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 0]);
    });

    it('carries in a flag opened before the window and still open', async () => {
      await event(8, PostEventAction.flag_created, '2024-09-01T00:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-09-05T00:00:00Z', '2024-09-05T04:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([1, 1, 1, 1]);
    });

    it('leaves out a flag opened and handled before the window', async () => {
      await event(9, PostEventAction.flag_created, '2024-10-01T00:00:00Z');
      await event(9, PostEventAction.flag_removed, '2024-10-01T05:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-10-05T00:00:00Z', '2024-10-05T04:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 0]);
    });

    it('adds up several posts flagged in the same hour', async () => {
      await event(10, PostEventAction.flag_created, '2024-11-01T01:00:00Z');
      await event(11, PostEventAction.flag_created, '2024-11-01T01:30:00Z');
      await event(12, PostEventAction.flag_created, '2024-11-01T02:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-11-01T00:00:00Z', '2024-11-01T04:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 2, 3, 3]);
    });

    it('keeps the events of one post out of the balance of another', async () => {
      await event(13, PostEventAction.flag_created, '2024-12-01T01:00:00Z');
      await event(14, PostEventAction.flag_removed, '2024-12-01T02:00:00Z');

      const series = await service.pendingSeries(
        hourly('2024-12-01T00:00:00Z', '2024-12-01T04:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 1, 1, 1]);
    });

    it('never reports a negative balance', async () => {
      await event(15, PostEventAction.flag_removed, '2025-01-01T01:00:00Z');
      await event(15, PostEventAction.deleted, '2025-01-01T02:00:00Z');
      await event(15, PostEventAction.flag_created, '2025-01-01T03:00:00Z');
      await event(15, PostEventAction.flag_removed, '2025-01-01T04:00:00Z');
      await event(15, PostEventAction.flag_removed, '2025-01-01T05:00:00Z');

      const series = await service.pendingSeries(
        hourly('2025-01-01T00:00:00Z', '2025-01-01T07:00:00Z'),
      );

      expect(series.every((point) => point.value >= 0)).toBe(true);
    });
  });
});
