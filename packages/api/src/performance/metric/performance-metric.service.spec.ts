import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction, TicketStatus } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { FlagLifecycleEntity } from 'src/flag/lifecycle/flag-lifecycle.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
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
  PerformanceGrade,
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
  let modActionFind: jest.Mock;
  let userFind: jest.Mock;
  let userFindOne: jest.Mock;

  beforeEach(async () => {
    postEventFind = jest.fn().mockResolvedValue([]);
    postVersionFind = jest.fn().mockResolvedValue([]);
    postReplacementFind = jest.fn().mockResolvedValue([]);
    ticketFind = jest.fn().mockResolvedValue([]);
    flagLifecycleFind = jest.fn().mockResolvedValue([]);
    modActionFind = jest.fn().mockResolvedValue([]);
    userFind = jest
      .fn()
      .mockResolvedValue([500, 501, 502, 600, 601].map((id) => ({ id })));
    userFindOne = jest.fn().mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        PerformanceMetricService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { find: userFind, findOne: userFindOne },
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
          provide: getRepositoryToken(ModActionEntity),
          useValue: { find: modActionFind },
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
        ...approvals(500, 40),
        ...approvals(501, 10),
      ]);

      const summaries = await service.performance(
        range('2025-02-01T00:00:00Z', '2025-02-04T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([500, 501]);
      expect(summaries.map((summary) => summary.position)).toEqual([1, 2]);
    });

    it('scores the work itself, one point per approval, whoever else is on the board', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 30),
        ...approvals(501, 10),
      ]);

      const summaries = await service.performance(
        range('2025-03-01T00:00:00Z', '2025-03-04T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries[0]!.score).toBe(30);
      expect(summaries[1]!.score).toBe(10);
    });

    it('grades against the middle of the board, so a typical person is an A', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 30),
        ...approvals(501, 20),
        ...approvals(502, 10),
      ]);

      const summaries = await service.performance(
        range('2025-03-10T00:00:00Z', '2025-03-14T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries.map((summary) => summary.scoreGrade)).toEqual([
        PerformanceGrade.S,
        PerformanceGrade.A,
        PerformanceGrade.C,
      ]);
    });

    it('lets the top change without moving anyone else, since the middle holds', async () => {
      const board = (top: number) => [
        ...approvals(500, top),
        ...approvals(501, 60),
        ...approvals(502, 50),
        ...approvals(503, 40),
        ...approvals(504, 30),
        ...approvals(505, 20),
        ...approvals(506, 10),
        ...approvals(507, 5),
      ];
      postEventFind.mockResolvedValue(board(3000));
      const withHero = await service.performance(
        range('2025-03-20T00:00:00Z', '2025-03-24T00:00:00Z'),
        { area: UserArea.Janitor },
      );
      postEventFind.mockResolvedValue(board(70));
      const without = await service.performance(
        range('2025-03-25T00:00:00Z', '2025-03-29T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      const letters = (rows: typeof withHero) =>
        rows.filter((row) => row.userId !== 500).map((row) => row.scoreGrade);
      expect(withHero[0]!.scoreGrade).toBe(PerformanceGrade.S6);
      expect(letters(withHero)).toEqual(letters(without));
    });

    it('grades a single user against the whole board, not against themselves', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 3000),
        ...approvals(501, 60),
        ...approvals(502, 50),
        ...approvals(503, 40),
        ...approvals(504, 30),
      ]);

      const [alone] = await service.performance(
        range('2025-04-10T00:00:00Z', '2025-04-14T00:00:00Z'),
        { userId: 500, area: UserArea.Janitor },
      );
      const board = await service.performance(
        range('2025-04-15T00:00:00Z', '2025-04-19T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(alone!.scoreGrade).toBe(PerformanceGrade.S6);
      expect(alone!.scoreGrade).toBe(board[0]!.scoreGrade);
    });

    it('keeps the cohort position when only one user was asked for', async () => {
      postEventFind.mockResolvedValue([
        ...approvals(500, 40),
        ...approvals(501, 10),
      ]);

      const summaries = await service.performance(
        range('2025-04-01T00:00:00Z', '2025-04-04T00:00:00Z'),
        { userId: 501, area: UserArea.Janitor },
      );

      expect(summaries).toHaveLength(1);
      expect(summaries[0]!.position).toBe(2);
    });

    it('gives a lone user no position at all', async () => {
      postEventFind.mockResolvedValue(approvals(500, 40));

      const summaries = await service.performance(
        range('2025-05-01T00:00:00Z', '2025-05-04T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries[0]!.position).toBe(0);
    });

    it('carries four windows of history, the asked-for one first', async () => {
      postEventFind
        .mockResolvedValueOnce([...approvals(500, 40), ...approvals(501, 10)])
        .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)])
        .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)])
        .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)]);

      const summaries = await service.performance(
        range('2025-06-01T00:00:00Z', '2025-06-04T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries[0]!.history.map((record) => record.score)).toEqual([
        40, 10, 10, 10,
      ]);
      expect(summaries[0]!.history[0]!.score).toBe(summaries[0]!.score);
    });

    it('reads the trend against the windows behind it', async () => {
      postEventFind
        .mockResolvedValueOnce([...approvals(500, 40), ...approvals(501, 10)])
        .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)])
        .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)])
        .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)]);

      const summaries = await service.performance(
        range('2025-06-10T00:00:00Z', '2025-06-13T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries[0]!.trend).toBe(300);
    });

    it('puts an open window on pace before reading its trend', async () => {
      jest.useFakeTimers({ now: new Date('2025-06-12T00:00:00Z') });
      try {
        postEventFind
          .mockResolvedValueOnce([...approvals(500, 40), ...approvals(501, 10)])
          .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)])
          .mockResolvedValueOnce([...approvals(500, 10), ...approvals(501, 10)])
          .mockResolvedValueOnce([
            ...approvals(500, 10),
            ...approvals(501, 10),
          ]);

        const summaries = await service.performance(
          range('2025-06-10T00:00:00Z', '2025-06-14T00:00:00Z'),
          { area: UserArea.Janitor },
        );

        expect(summaries[0]!.score).toBe(40);
        expect(summaries[0]!.trend).toBe(700);
      } finally {
        jest.useRealTimers();
      }
    });

    it('lists the days a user was active, not the days in the window', async () => {
      const onDay = (day: string, from: number, count: number) =>
        Array.from(
          { length: count },
          (_, index) =>
            new PostEventEntity({
              id: from + index,
              postId: from + index,
              creatorId: 500,
              action: PostEventAction.approved,
              createdAt: new Date(
                `${day}T${String(index).padStart(2, '0')}:00:00Z`,
              ),
            }),
        );
      postEventFind.mockResolvedValue([
        ...onDay('2025-07-02', 1, 10),
        ...onDay('2025-07-03', 11, 10),
      ]);

      const summaries = await service.performance(
        range('2025-07-01T00:00:00Z', '2025-07-05T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries[0]!.attendance).toEqual([
        new Date('2025-07-02T00:00:00Z'),
        new Date('2025-07-03T00:00:00Z'),
      ]);
      expect(summaries[0]!.activity['approved']).toBe(20);
    });

    it('puts nobody on the janitor board for staff notes alone', async () => {
      postEventFind.mockResolvedValue(approvals(500, 20));
      modActionFind.mockResolvedValue([
        new ModActionEntity({
          id: 9,
          creatorId: 777,
          action: 'staff_note_create' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { id: 1, user_id: 7, body: 'note' },
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([500]);
    });

    it('folds an artist link into the takedown it was filed for', async () => {
      modActionFind.mockResolvedValue([
        new ModActionEntity({
          id: 1,
          creatorId: 600,
          action: 'artist_user_linked' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { artist_page: 'a', user_id: 7 },
        }),
        new ModActionEntity({
          id: 2,
          creatorId: 600,
          action: 'takedown_process' as never,
          createdAt: new Date('2025-08-02T00:03:00Z'),
          values: { takedown_id: 1 },
        }),
        new ModActionEntity({
          id: 3,
          creatorId: 600,
          action: 'artist_user_linked' as never,
          createdAt: new Date('2025-08-02T05:00:00Z'),
          values: { artist_page: 'b', user_id: 8 },
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Admin },
      );

      expect(summaries[0]!.activity).toEqual({
        takedown_process: 1,
        artist_user_linked: 1,
      });
    });

    it('counts a burst of alias approvals as one decision', async () => {
      const approved = (id: number, seconds: number) =>
        new ModActionEntity({
          id,
          creatorId: 600,
          action: 'tag_alias_update' as never,
          createdAt: new Date(
            `2025-08-02T00:00:${String(seconds).padStart(2, '0')}Z`,
          ),
          values: {
            alias_id: id,
            change_desc:
              'changed status from "pending" to "queued", set approver_id to "600"',
          },
        });
      modActionFind.mockResolvedValue([
        approved(1, 0),
        approved(2, 1),
        approved(3, 2),
        approved(4, 40),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Admin },
      );

      expect(summaries[0]!.activity).toEqual({ aibur_approved: 2 });
    });

    it('ignores someone hiding their own forum post, since that is not moderation', async () => {
      modActionFind.mockResolvedValue([
        new ModActionEntity({
          id: 1,
          creatorId: 800,
          action: 'forum_post_hide' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { forum_post_id: 1, forum_topic_id: 1, user_id: 800 },
        }),
        new ModActionEntity({
          id: 2,
          creatorId: 600,
          action: 'forum_post_hide' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { forum_post_id: 2, forum_topic_id: 1, user_id: 800 },
        }),
        new ModActionEntity({
          id: 3,
          creatorId: 600,
          action: 'ticket_update' as never,
          createdAt: new Date('2025-08-02T01:00:00Z'),
          values: { ticket_id: 1, status: 'approved' },
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Moderator },
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([600]);
    });

    it('never reads the users table, since a board is defined by the work done', async () => {
      postEventFind.mockResolvedValue(approvals(500, 20));

      await service.performance(
        range('2025-08-05T00:00:00Z', '2025-08-08T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(userFind).not.toHaveBeenCalled();
      expect(userFindOne).not.toHaveBeenCalled();
    });

    it('scores a moderator on the ticket update that closed the ticket', async () => {
      modActionFind.mockResolvedValue([
        new ModActionEntity({
          id: 1,
          creatorId: 600,
          action: 'ticket_update' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { ticket_id: 1, status: 'approved' },
        }),
        new ModActionEntity({
          id: 2,
          creatorId: 600,
          action: 'ticket_claim' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { ticket_id: 1 },
        }),
        new ModActionEntity({
          id: 3,
          creatorId: 601,
          action: 'ticket_update' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { ticket_id: 2, status: 'partial' },
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Moderator },
      );

      const byUser = Object.fromEntries(
        summaries.map((summary) => [summary.userId, summary.activity]),
      );
      expect(byUser[600]).toEqual({ ticket_update_approved: 1 });
      expect(byUser[601]).toEqual({ ticket_update_partial: 1 });
      expect(postEventFind).not.toHaveBeenCalled();
    });

    it('counts a ban once, dropping the feedback the ban writes for itself', async () => {
      modActionFind.mockResolvedValue([
        new ModActionEntity({
          id: 1,
          creatorId: 600,
          action: 'user_feedback_create' as never,
          createdAt: new Date('2025-08-02T00:00:00.000Z'),
          values: {
            user_id: 7,
            reason: 'Banned permanently.',
            type: 'negative',
          },
        }),
        new ModActionEntity({
          id: 2,
          creatorId: 600,
          action: 'user_ban' as never,
          createdAt: new Date('2025-08-02T00:00:00.400Z'),
          values: { user_id: 7, duration: -1, reason: 'spam' },
        }),
        new ModActionEntity({
          id: 3,
          creatorId: 600,
          action: 'user_feedback_create' as never,
          createdAt: new Date('2025-08-02T01:00:00Z'),
          values: { user_id: 8, reason: 'helpful', type: 'positive' },
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Moderator },
      );

      expect(summaries[0]!.activity).toEqual({
        user_ban: 1,
        user_feedback_create: 1,
      });
    });

    it('reads a staff note from mod actions onto the janitor board', async () => {
      postEventFind.mockResolvedValue(approvals(500, 20));
      modActionFind.mockResolvedValue([
        new ModActionEntity({
          id: 9,
          creatorId: 500,
          action: 'staff_note_create' as never,
          createdAt: new Date('2025-08-02T00:00:00Z'),
          values: { id: 1, user_id: 7, body: 'note' },
        }),
      ]);

      const summaries = await service.performance(
        range('2025-08-01T00:00:00Z', '2025-08-04T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(summaries[0]!.activity).toEqual({
        approved: 20,
        staff_note_create: 1,
      });
    });

    it('measures a member on nothing, so the board comes back empty', async () => {
      postEventFind.mockResolvedValue(approvals(500, 40));
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

  describe('weights', () => {
    it('prices each action of an area in score, not seconds', () => {
      const { weights } = service.weights({ area: UserArea.Janitor });

      expect(weights['approved']).toBe(1);
      expect(weights['deleted']).toBeCloseTo(17 / 6);
    });

    it('prices nothing for a member, since members take no scored action', () => {
      expect(service.weights({ area: UserArea.Member }).weights).toEqual({});
    });
  });

  describe('series', () => {
    const events = (
      creatorId: number,
      action: PostEventAction,
      date: string,
      count: number,
    ): PostEventEntity[] =>
      Array.from(
        { length: count },
        (_, index) =>
          new PostEventEntity({
            id: creatorId * 1000 + index,
            postId: index,
            creatorId,
            action,
            createdAt: new Date(date),
          }),
      );

    it('spreads a user score over the days it was earned, weighted like the board', async () => {
      userFindOne.mockResolvedValue({ id: 500, levelString: 'Janitor' });
      postEventFind.mockResolvedValue([
        ...events(500, PostEventAction.approved, '2025-09-02T10:00:00Z', 3),
        ...events(500, PostEventAction.deleted, '2025-09-03T10:00:00Z', 6),
        ...events(501, PostEventAction.approved, '2025-09-03T10:00:00Z', 9),
      ]);

      const points = await service.series(
        range('2025-09-01T00:00:00Z', '2025-09-04T00:00:00Z'),
        { userId: 500 },
      );

      expect(points.map((point) => point.score)).toEqual([0, 3, 17]);
      expect(points[2]!.scores['deleted']).toBe(17);
      expect(points[2]!.scores['approved']).toBe(0);
    });

    it('sums the whole area when no user is named', async () => {
      postEventFind.mockResolvedValue([
        ...events(500, PostEventAction.approved, '2025-09-12T10:00:00Z', 3),
        ...events(501, PostEventAction.approved, '2025-09-12T10:00:00Z', 2),
      ]);

      const points = await service.series(
        range('2025-09-12T00:00:00Z', '2025-09-13T00:00:00Z'),
        { area: UserArea.Janitor },
      );

      expect(points[0]!.score).toBe(5);
    });
  });
});
