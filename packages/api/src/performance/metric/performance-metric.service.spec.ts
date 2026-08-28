import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction, TicketStatus } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { FlagLifecycleEntity } from 'src/flag/lifecycle/flag-lifecycle.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';
import { SystemUserService } from 'src/user/system/system-user.service';
import { UserEntity } from 'src/user/user.entity';
import { FindManyOptions, FindOptionsWhere, IsNull, Not } from 'typeorm';

import {
  Activity,
  ActivitySummaryQuery,
  UserArea,
} from './performance-metric.dto';
import { PerformanceMetricService } from './performance-metric.service';

const SYSTEM_USER_ID = 360277;

const range = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: new Date(start),
    endDate: new Date(end),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

const activityKeys = (point: object): string[] =>
  Object.keys(point)
    .filter((key) => key !== 'date')
    .sort();

const covers = (operator: unknown, start: string, end: string): boolean => {
  const both = operator as { type?: string; value?: unknown } | undefined;
  if (both?.type !== 'and') return false;

  const [after, before] = both.value as [
    { type: string; value: Date },
    { type: string; value: Date },
  ];

  return (
    after?.type === 'moreThanOrEqual' &&
    before?.type === 'lessThan' &&
    after.value.getTime() === new Date(start).getTime() &&
    before.value.getTime() === new Date(end).getTime()
  );
};

describe('PerformanceMetricService', () => {
  let service: PerformanceMetricService;
  let postEventFind: jest.Mock;
  let postVersionFind: jest.Mock;
  let postReplacementFind: jest.Mock;
  let ticketFind: jest.Mock;
  let flagLifecycleFind: jest.Mock;
  let userFindOne: jest.Mock;

  beforeEach(async () => {
    postEventFind = jest.fn().mockResolvedValue([]);
    postVersionFind = jest.fn().mockResolvedValue([]);
    postReplacementFind = jest.fn().mockResolvedValue([]);
    ticketFind = jest.fn().mockResolvedValue([]);
    flagLifecycleFind = jest.fn().mockResolvedValue([]);
    userFindOne = jest.fn().mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        PerformanceMetricService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOne: userFindOne },
        },
        {
          provide: getRepositoryToken(PostVersionEntity),
          useValue: { find: postVersionFind },
        },
        {
          provide: getRepositoryToken(PostReplacementEntity),
          useValue: { find: postReplacementFind },
        },
        {
          provide: getRepositoryToken(TicketEntity),
          useValue: { find: ticketFind },
        },
        {
          provide: getRepositoryToken(PostEventEntity),
          useValue: { find: postEventFind },
        },
        {
          provide: getRepositoryToken(FlagLifecycleEntity),
          useValue: { find: flagLifecycleFind },
        },
        {
          provide: SystemUserService,
          useValue: {
            id: SYSTEM_USER_ID,
            isSystem: (userId?: number) => userId === SYSTEM_USER_ID,
          },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PerformanceMetricService);
    await CacheManager.getInstance().clear();
  });

  describe('the automated account', () => {
    it('drops it from a leaderboard, where no user was asked for', async () => {
      postEventFind.mockResolvedValue([
        new PostEventEntity({
          id: 1,
          postId: 1,
          creatorId: SYSTEM_USER_ID,
          action: PostEventAction.approved,
          createdAt: new Date('2024-01-02T00:00:00Z'),
        }),
        new PostEventEntity({
          id: 2,
          postId: 2,
          creatorId: 500,
          action: PostEventAction.approved,
          createdAt: new Date('2024-01-02T00:00:00Z'),
        }),
      ]);

      const points = await service.activity(
        range('2024-01-01T00:00:00Z', '2024-01-04T00:00:00Z'),
        new ActivitySummaryQuery({ activities: [Activity.PostApprove] }),
      );

      const total = points.reduce((sum, point) => sum + point.postApprove, 0);

      expect(total).toBe(1);
    });

    it('keeps its own work when it is the user asked for', async () => {
      postEventFind.mockResolvedValue([
        new PostEventEntity({
          id: 1,
          postId: 1,
          creatorId: SYSTEM_USER_ID,
          action: PostEventAction.approved,
          createdAt: new Date('2024-02-02T00:00:00Z'),
        }),
      ]);

      const points = await service.activity(
        range('2024-02-01T00:00:00Z', '2024-02-04T00:00:00Z'),
        new ActivitySummaryQuery({
          userId: SYSTEM_USER_ID,
          activities: [Activity.PostApprove],
        }),
      );

      const total = points.reduce((sum, point) => sum + point.postApprove, 0);

      expect(total).toBe(1);
    });

    it('narrows the query to the user asked for', async () => {
      await service.activity(
        range('2024-03-01T00:00:00Z', '2024-03-04T00:00:00Z'),
        new ActivitySummaryQuery({
          userId: 500,
          activities: [Activity.PostApprove],
        }),
      );

      const where = (
        postEventFind.mock.calls[0]![0] as FindManyOptions<PostEventEntity>
      ).where as FindOptionsWhere<PostEventEntity>;

      expect(where.creatorId).toBe(500);
      expect(where.action).toBe(PostEventAction.approved);
    });
  });

  describe('the activities an area is measured on', () => {
    it.each([
      [
        UserArea.Member,
        ['postCreate', 'postReplacementCreate', 'ticketCreate'],
      ],
      [UserArea.Moderator, ['ticketHandle']],
      [UserArea.Admin, []],
    ])('measures %s on %s when no user is named', async (area, expected) => {
      const points = await service.activity(
        range('2024-04-01T00:00:00Z', '2024-04-04T00:00:00Z'),
        new ActivitySummaryQuery({ area }),
      );

      expect(activityKeys(points[0]!)).toEqual(expected);
    });

    it('measures a janitor on the whole handling funnel', async () => {
      const points = await service.activity(
        range('2024-05-01T00:00:00Z', '2024-05-04T00:00:00Z'),
        new ActivitySummaryQuery({ area: UserArea.Janitor }),
      );

      expect(activityKeys(points[0]!)).toEqual([
        'flagHandle',
        'postApprove',
        'postDelete',
        'postReplacementApprove',
        'postReplacementPromote',
        'postReplacementReject',
      ]);
    });

    it('adds what a named janitor filed to what they handled', async () => {
      const points = await service.activity(
        range('2024-06-01T00:00:00Z', '2024-06-04T00:00:00Z'),
        new ActivitySummaryQuery({ area: UserArea.Janitor, userId: 500 }),
      );

      expect(activityKeys(points[0]!)).toEqual([
        'flagHandle',
        'postApprove',
        'postCreate',
        'postDelete',
        'postReplacementApprove',
        'postReplacementPromote',
        'postReplacementReject',
        'ticketCreate',
      ]);
    });

    it('lets an explicit activity list override the area', async () => {
      const points = await service.activity(
        range('2024-07-01T00:00:00Z', '2024-07-04T00:00:00Z'),
        new ActivitySummaryQuery({
          area: UserArea.Janitor,
          activities: [Activity.TicketHandle],
        }),
      );

      expect(activityKeys(points[0]!)).toEqual(['ticketHandle']);
    });

    it('reads the area off the named user when none was given', async () => {
      userFindOne.mockResolvedValue(
        new UserEntity({ id: 500, levelString: 'Janitor' }),
      );

      const points = await service.activity(
        range('2024-08-01T00:00:00Z', '2024-08-04T00:00:00Z'),
        new ActivitySummaryQuery({ userId: 500 }),
      );

      expect(activityKeys(points[0]!)).toContain('flagHandle');
    });

    it('measures staff as a member, since staff take none of the actions we score', async () => {
      userFindOne.mockResolvedValue(
        new UserEntity({ id: 501, levelString: 'Staff' }),
      );

      const points = await service.activity(
        range('2024-09-01T00:00:00Z', '2024-09-04T00:00:00Z'),
        new ActivitySummaryQuery({ userId: 501 }),
      );

      expect(activityKeys(points[0]!)).toEqual([
        'postCreate',
        'postReplacementCreate',
        'ticketCreate',
      ]);
    });

    it('measures an anonymous caller as a member', async () => {
      const points = await service.activity(
        range('2024-10-01T00:00:00Z', '2024-10-04T00:00:00Z'),
      );

      expect(activityKeys(points[0]!)).toEqual([
        'postCreate',
        'postReplacementCreate',
        'ticketCreate',
      ]);
    });
  });

  describe('what counts as an activity', () => {
    it('credits a handled ticket to its handler on the day it was updated', async () => {
      await service.activity(
        range('2024-11-01T00:00:00Z', '2024-11-04T00:00:00Z'),
        new ActivitySummaryQuery({ activities: [Activity.TicketHandle] }),
      );

      const where = (
        ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
      ).where as FindOptionsWhere<TicketEntity>;

      expect(where.status).toBe(TicketStatus.approved);
      expect(
        covers(where.updatedAt, '2024-11-01T00:00:00Z', '2024-11-04T00:00:00Z'),
      ).toBe(true);
      expect(where.handlerId).toEqual(Not(IsNull()));
      expect(where).not.toHaveProperty('createdAt');
    });

    it('counts only the first version of a post as its creation', async () => {
      await service.activity(
        range('2024-12-01T00:00:00Z', '2024-12-04T00:00:00Z'),
        new ActivitySummaryQuery({ activities: [Activity.PostCreate] }),
      );

      const where = (
        postVersionFind.mock.calls[0]![0] as FindManyOptions<PostVersionEntity>
      ).where as FindOptionsWhere<PostVersionEntity>;

      expect(where.version).toBe(1);
    });

    it('credits a handled flag on the hour it was handled', async () => {
      await service.activity(
        range('2025-01-01T00:00:00Z', '2025-01-04T00:00:00Z'),
        new ActivitySummaryQuery({ activities: [Activity.FlagHandle] }),
      );

      const where = (
        flagLifecycleFind.mock
          .calls[0]![0] as FindManyOptions<FlagLifecycleEntity>
      ).where as FindOptionsWhere<FlagLifecycleEntity>;

      expect(
        covers(where.handledAt, '2025-01-01T00:00:00Z', '2025-01-04T00:00:00Z'),
      ).toBe(true);
      expect(where.handlerId).toEqual(Not(IsNull()));
    });

    it('credits a handled flag to the handler asked for', async () => {
      await service.activity(
        range('2025-01-10T00:00:00Z', '2025-01-14T00:00:00Z'),
        new ActivitySummaryQuery({
          userId: 500,
          activities: [Activity.FlagHandle],
        }),
      );

      const where = (
        flagLifecycleFind.mock
          .calls[0]![0] as FindManyOptions<FlagLifecycleEntity>
      ).where as FindOptionsWhere<FlagLifecycleEntity>;

      expect(where.handlerId).toBe(500);
    });
  });

  describe('performance', () => {
    const approvals = (creatorId: number, count: number): PostEventEntity[] =>
      Array.from(
        { length: count },
        (_, index) =>
          new PostEventEntity({
            id: creatorId * 1000 + index,
            postId: index,
            creatorId,
            action: PostEventAction.approved,
            createdAt: new Date('2025-02-02T00:00:00Z'),
          }),
      );

    it('ranks by score and gives every user a position', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 4),
        ...approvals(501, 1),
      ]);

      const summaries = await service.performance(
        range('2025-02-01T00:00:00Z', '2025-02-04T00:00:00Z'),
        { activities: [Activity.PostApprove] },
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([500, 501]);
      expect(summaries.map((summary) => summary.position)).toEqual([1, 2]);
    });

    it('scores against the cohort average, so the average scores one hundred', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 3),
        ...approvals(501, 1),
      ]);

      const summaries = await service.performance(
        range('2025-03-01T00:00:00Z', '2025-03-04T00:00:00Z'),
        { activities: [Activity.PostApprove] },
      );

      expect(summaries[0]!.score).toBe(150);
      expect(summaries[1]!.score).toBe(50);
    });

    it('keeps the cohort position when only one user was asked for', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 4),
        ...approvals(501, 1),
      ]);

      const summaries = await service.performance(
        range('2025-04-01T00:00:00Z', '2025-04-04T00:00:00Z'),
        { userId: 501, activities: [Activity.PostApprove] },
      );

      expect(summaries).toHaveLength(1);
      expect(summaries[0]!.position).toBe(2);
    });

    it('gives a lone user no position at all', async () => {
      postEventFind.mockResolvedValue(approvals(500, 4));

      const summaries = await service.performance(
        range('2025-05-01T00:00:00Z', '2025-05-04T00:00:00Z'),
        { activities: [Activity.PostApprove] },
      );

      expect(summaries[0]!.position).toBe(0);
    });

    it('carries four windows of history, the asked-for one first', async () => {
      postEventFind
        .mockResolvedValueOnce([...approvals(500, 4), ...approvals(501, 1)])
        .mockResolvedValueOnce([...approvals(500, 1), ...approvals(501, 1)])
        .mockResolvedValueOnce([...approvals(500, 1), ...approvals(501, 1)])
        .mockResolvedValueOnce([...approvals(500, 1), ...approvals(501, 1)]);

      const summaries = await service.performance(
        range('2025-06-01T00:00:00Z', '2025-06-04T00:00:00Z'),
        { activities: [Activity.PostApprove] },
      );

      expect(summaries[0]!.history.map((record) => record.score)).toEqual([
        160, 100, 100, 100,
      ]);
      expect(summaries[0]!.history[0]!.score).toBe(summaries[0]!.score);
    });

    it('reads the trend against the windows behind it', async () => {
      postEventFind
        .mockResolvedValueOnce([...approvals(500, 4), ...approvals(501, 1)])
        .mockResolvedValueOnce([...approvals(500, 1), ...approvals(501, 1)])
        .mockResolvedValueOnce([...approvals(500, 1), ...approvals(501, 1)])
        .mockResolvedValueOnce([...approvals(500, 1), ...approvals(501, 1)]);

      const summaries = await service.performance(
        range('2025-06-10T00:00:00Z', '2025-06-14T00:00:00Z'),
        { activities: [Activity.PostApprove] },
      );

      expect(summaries[0]!.trend).toBe(60);
    });

    it('counts the days a user was active, not the days in the window', async () => {
      postEventFind.mockResolvedValue([
        new PostEventEntity({
          id: 1,
          postId: 1,
          creatorId: 500,
          action: PostEventAction.approved,
          createdAt: new Date('2025-07-02T01:00:00Z'),
        }),
        new PostEventEntity({
          id: 2,
          postId: 2,
          creatorId: 500,
          action: PostEventAction.approved,
          createdAt: new Date('2025-07-02T23:00:00Z'),
        }),
        new PostEventEntity({
          id: 3,
          postId: 3,
          creatorId: 500,
          action: PostEventAction.approved,
          createdAt: new Date('2025-07-03T01:00:00Z'),
        }),
      ]);

      const summaries = await service.performance(
        range('2025-07-01T00:00:00Z', '2025-07-05T00:00:00Z'),
        { activities: [Activity.PostApprove] },
      );

      expect(summaries[0]!.days).toBe(2);
      expect(summaries[0]!.activity.postApprove).toBe(3);
    });

    it('measures a member on nothing, so the board comes back empty', async () => {
      postEventFind.mockResolvedValue(approvals(500, 4));
      postVersionFind.mockResolvedValue([
        new PostVersionEntity({
          id: 1,
          version: 1,
          updaterId: 500,
          updatedAt: new Date('2025-08-02T00:00:00Z'),
        }),
      ]);
      ticketFind.mockResolvedValue([
        new TicketEntity({
          id: 1,
          creatorId: 500,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          updatedAt: new Date('2025-08-02T00:00:00Z'),
        }),
      ]);
      postReplacementFind.mockResolvedValue([
        new PostReplacementEntity({
          id: 1,
          creatorId: 500,
          createdAt: new Date('2025-08-02T00:00:00Z'),
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Member },
      );

      expect(summaries).toEqual([]);
    });
  });
});
