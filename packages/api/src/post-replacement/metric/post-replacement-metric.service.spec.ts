import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction, PostReplacementStatus } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { FindManyOptions, FindOptionsWhere, Not } from 'typeorm';

import { PostReplacementEntity } from '../post-replacement.entity';
import { PostReplacementHandledQuery } from './post-replacement-metric.dto';
import { PostReplacementMetricService } from './post-replacement-metric.service';

const at = (iso: string): Date => new Date(iso);

const inRange = (
  operator: unknown,
  startIso: string,
  endIso: string,
): boolean => {
  const both = operator as { type?: string; value?: unknown } | undefined;
  if (both?.type !== 'and') return false;

  const [after, before] = both.value as [
    { type: string; value: Date },
    { type: string; value: Date },
  ];

  return (
    after?.type === 'moreThanOrEqual' &&
    before?.type === 'lessThan' &&
    after.value.getTime() === at(startIso).getTime() &&
    before.value.getTime() === at(endIso).getTime()
  );
};

const week = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

const replacement = (
  id: number,
  status: PostReplacementStatus,
  createdIso: string,
  updatedIso: string = createdIso,
): PostReplacementEntity =>
  new PostReplacementEntity({
    id,
    postId: id,
    creatorId: 1,
    status,
    createdAt: at(createdIso),
    updatedAt: at(updatedIso),
  });

const event = (
  id: number,
  action: PostEventAction,
  iso: string,
): PostEventEntity =>
  new PostEventEntity({
    id,
    postId: id,
    creatorId: 1,
    action,
    createdAt: at(iso),
  });

describe('PostReplacementMetricService', () => {
  let service: PostReplacementMetricService;
  let replacementFind: jest.Mock;
  let eventFind: jest.Mock;

  beforeEach(async () => {
    replacementFind = jest.fn().mockResolvedValue([]);
    eventFind = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        PostReplacementMetricService,
        {
          provide: getRepositoryToken(PostReplacementEntity),
          useValue: { find: replacementFind },
        },
        {
          provide: getRepositoryToken(PostEventEntity),
          useValue: { find: eventFind },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PostReplacementMetricService);
    await CacheManager.getInstance().clear();
  });

  describe('created', () => {
    it('leaves out the original file, which is a row rather than a replacement', async () => {
      await service.created(
        week('2024-01-01T00:00:00Z', '2024-01-04T00:00:00Z'),
      );

      const where = (
        replacementFind.mock
          .calls[0]![0] as FindManyOptions<PostReplacementEntity>
      ).where as FindOptionsWhere<PostReplacementEntity>;

      expect(where.status).toEqual(Not(PostReplacementStatus.original));
      expect(
        inRange(
          where.createdAt,
          '2024-01-01T00:00:00Z',
          '2024-01-04T00:00:00Z',
        ),
      ).toBe(true);
    });

    it('counts each replacement on the day it was filed', async () => {
      replacementFind.mockResolvedValue([
        replacement(1, PostReplacementStatus.pending, '2024-02-01T01:00:00Z'),
        replacement(2, PostReplacementStatus.approved, '2024-02-03T01:00:00Z'),
      ]);

      const series = await service.created(
        week('2024-02-01T00:00:00Z', '2024-02-04T00:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([1, 0, 1]);
    });
  });

  describe('status', () => {
    it('reads the window from filing and from settling, and skips originals', async () => {
      await service.status(
        week('2024-03-01T00:00:00Z', '2024-03-04T00:00:00Z'),
      );

      const where = (
        replacementFind.mock
          .calls[0]![0] as FindManyOptions<PostReplacementEntity>
      ).where as FindOptionsWhere<PostReplacementEntity>[];

      const filed = where.find((clause) => 'createdAt' in clause)!;
      const settled = where.find((clause) => 'updatedAt' in clause)!;

      expect(
        inRange(
          filed.createdAt,
          '2024-03-01T00:00:00Z',
          '2024-03-04T00:00:00Z',
        ),
      ).toBe(true);
      expect(
        inRange(
          settled.updatedAt,
          '2024-03-01T00:00:00Z',
          '2024-03-04T00:00:00Z',
        ),
      ).toBe(true);
      expect(filed.status).toEqual(Not(PostReplacementStatus.original));
      expect(settled.status).toEqual(Not(PostReplacementStatus.original));
    });

    it('holds a replacement pending from filing until it settled', async () => {
      replacementFind.mockResolvedValue([
        replacement(
          1,
          PostReplacementStatus.pending,
          '2024-04-01T01:00:00Z',
          '2024-04-03T01:00:00Z',
        ),
      ]);

      const points = await service.status(
        week('2024-04-01T00:00:00Z', '2024-04-04T00:00:00Z'),
      );

      expect(points.map((point) => point.pending)).toEqual([1, 1, 1]);
    });

    it('clamps a replacement that settled after the window to the window end', async () => {
      replacementFind.mockResolvedValue([
        replacement(
          1,
          PostReplacementStatus.approved,
          '2024-05-02T01:00:00Z',
          '2024-06-01T01:00:00Z',
        ),
      ]);

      const points = await service.status(
        week('2024-05-01T00:00:00Z', '2024-05-04T00:00:00Z'),
      );

      expect(points.map((point) => point.approved)).toEqual([0, 1, 1]);
    });

    it('spans a replacement filed and settled on one day across that day alone', async () => {
      replacementFind.mockResolvedValue([
        replacement(
          1,
          PostReplacementStatus.approved,
          '2024-05-12T01:00:00Z',
          '2024-05-12T05:00:00Z',
        ),
      ]);

      const points = await service.status(
        week('2024-05-11T00:00:00Z', '2024-05-14T00:00:00Z'),
      );

      expect(points.map((point) => point.approved)).toEqual([0, 1, 0]);
    });
  });

  describe('handled', () => {
    it('reads the three settling events and nothing else', async () => {
      await service.handled(
        week('2024-06-01T00:00:00Z', '2024-06-04T00:00:00Z'),
      );

      const where = (
        eventFind.mock.calls[0]![0] as FindManyOptions<PostEventEntity>
      ).where as FindOptionsWhere<PostEventEntity>;

      const actions = (where.action as unknown as { value: string[] }).value;

      expect(actions).toHaveLength(3);
      expect(actions).toEqual(
        expect.arrayContaining([
          PostEventAction.replacement_accepted,
          PostEventAction.replacement_rejected,
          PostEventAction.replacement_promoted,
        ]),
      );
    });

    it('reads only the events of the window it was asked for', async () => {
      await service.handled(
        week('2024-06-10T00:00:00Z', '2024-06-14T00:00:00Z'),
      );

      const where = (
        eventFind.mock.calls[0]![0] as FindManyOptions<PostEventEntity>
      ).where as FindOptionsWhere<PostEventEntity>;

      expect(
        inRange(
          where.createdAt,
          '2024-06-10T00:00:00Z',
          '2024-06-14T00:00:00Z',
        ),
      ).toBe(true);
    });

    it('reports an accepted event as an approval', async () => {
      eventFind.mockResolvedValue([
        event(1, PostEventAction.replacement_accepted, '2024-07-02T01:00:00Z'),
        event(2, PostEventAction.replacement_promoted, '2024-07-02T02:00:00Z'),
        event(3, PostEventAction.replacement_rejected, '2024-07-03T01:00:00Z'),
      ]);

      const points = await service.handled(
        week('2024-07-01T00:00:00Z', '2024-07-04T00:00:00Z'),
      );

      expect(
        points.map(({ approved, promoted, rejected }) => ({
          approved,
          promoted,
          rejected,
        })),
      ).toEqual([
        { approved: 0, promoted: 0, rejected: 0 },
        { approved: 1, promoted: 1, rejected: 0 },
        { approved: 0, promoted: 0, rejected: 1 },
      ]);
    });

    it('narrows to one handler when asked for one', async () => {
      await service.handled(
        week('2024-08-01T00:00:00Z', '2024-08-04T00:00:00Z'),
        new PostReplacementHandledQuery({ userId: 500 }),
      );

      const where = (
        eventFind.mock.calls[0]![0] as FindManyOptions<PostEventEntity>
      ).where as FindOptionsWhere<PostEventEntity>;

      expect(where.creatorId).toBe(500);
    });
  });
});
