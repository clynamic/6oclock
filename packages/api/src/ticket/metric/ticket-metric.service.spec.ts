import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TicketStatus } from 'src/api/e621';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange } from 'src/common';
import { SystemUserService } from 'src/user/system/system-user.service';
import { FindManyOptions, FindOptionsWhere, IsNull, Not } from 'typeorm';

import { TicketLifecycleEntity } from '../lifecycle/ticket-lifecycle.entity';
import { TicketEntity } from '../ticket.entity';
import { TicketMetricService } from './ticket-metric.service';

const SYSTEM_USER_ID = 360277;

type BuilderCalls = Record<string, unknown[][]>;

const createBuilder = (): { builder: unknown; calls: BuilderCalls } => {
  const calls: BuilderCalls = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
      return builder;
    };

  const builder = {
    where: record('where'),
    andWhere: record('andWhere'),
    select: record('select'),
    addSelect: record('addSelect'),
    groupBy: record('groupBy'),
    orderBy: record('orderBy'),
    take: record('take'),
    skip: record('skip'),
    limit: record('limit'),
    offset: record('offset'),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  return { builder, calls };
};

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
    after.value.getTime() === new Date(startIso).getTime() &&
    before.value.getTime() === new Date(endIso).getTime()
  );
};

describe('TicketMetricService', () => {
  let service: TicketMetricService;
  let ticketFind: jest.Mock;
  let lifecycleFind: jest.Mock;
  let ticketBuilder: { builder: unknown; calls: BuilderCalls };
  let lifecycleBuilder: { builder: unknown; calls: BuilderCalls };

  beforeEach(async () => {
    ticketFind = jest.fn().mockResolvedValue([]);
    lifecycleFind = jest.fn().mockResolvedValue([]);
    ticketBuilder = createBuilder();
    lifecycleBuilder = createBuilder();

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        TicketMetricService,
        {
          provide: getRepositoryToken(TicketEntity),
          useValue: {
            find: ticketFind,
            count: jest.fn().mockResolvedValue(0),
            createQueryBuilder: () => ticketBuilder.builder,
          },
        },
        {
          provide: getRepositoryToken(TicketLifecycleEntity),
          useValue: {
            find: lifecycleFind,
            createQueryBuilder: () => lifecycleBuilder.builder,
          },
        },
        { provide: SystemUserService, useValue: { id: SYSTEM_USER_ID } },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(TicketMetricService);
    await CacheManager.getInstance().clear();
  });

  describe('status', () => {
    it('admits tickets opened before the window that are still open', async () => {
      await service.status(
        new PartialDateRange({
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-02-01T00:00:00Z'),
        }),
      );

      const where = (
        ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
      ).where as FindOptionsWhere<TicketEntity>[];

      expect(where).toContainEqual({
        createdAt: expect.objectContaining({ type: 'lessThan' }),
        status: Not(TicketStatus.approved),
      });
    });

    it('reads the window from creation and from update, not creation alone', async () => {
      await service.status(
        new PartialDateRange({
          startDate: new Date('2024-03-01T00:00:00Z'),
          endDate: new Date('2024-04-01T00:00:00Z'),
        }),
      );

      const where = (
        ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
      ).where as FindOptionsWhere<TicketEntity>[];

      expect(
        inRange(
          where[0]!.createdAt,
          '2024-03-01T00:00:00Z',
          '2024-04-01T00:00:00Z',
        ),
      ).toBe(true);
      expect(
        inRange(
          where[1]!.updatedAt,
          '2024-03-01T00:00:00Z',
          '2024-04-01T00:00:00Z',
        ),
      ).toBe(true);
    });
  });

  describe('closedSeries', () => {
    it('reads the lifecycle table on resolution, not the ticket table on creation', async () => {
      await service.closedSeries(
        new PartialDateRange({
          startDate: new Date('2024-05-01T00:00:00Z'),
          endDate: new Date('2024-06-01T00:00:00Z'),
        }),
      );

      expect(ticketFind).not.toHaveBeenCalled();

      const options = lifecycleFind.mock
        .calls[0]![0] as FindManyOptions<TicketLifecycleEntity>;
      const where = options.where as FindOptionsWhere<TicketLifecycleEntity>;

      expect(
        inRange(
          where.resolvedAt,
          '2024-05-01T00:00:00Z',
          '2024-06-01T00:00:00Z',
        ),
      ).toBe(true);
      expect(where).not.toHaveProperty('createdAt');
      expect(options.select).toEqual(['resolvedAt']);
    });

    it('narrows to one handler when asked for one', async () => {
      await service.closedSeries(
        new PartialDateRange({
          startDate: new Date('2024-07-01T00:00:00Z'),
          endDate: new Date('2024-08-01T00:00:00Z'),
        }),
        { handlerId: 42 } as Parameters<typeof service.closedSeries>[1],
      );

      const where = (
        lifecycleFind.mock
          .calls[0]![0] as FindManyOptions<TicketLifecycleEntity>
      ).where as FindOptionsWhere<TicketLifecycleEntity>;

      expect(where.handlerId).toBe(42);
    });
  });

  describe('handlerSummary', () => {
    it('credits the window a ticket was resolved in, not the one it was filed in', async () => {
      await service.handlerSummary(
        new PartialDateRange({
          startDate: new Date('2024-09-01T00:00:00Z'),
          endDate: new Date('2024-10-01T00:00:00Z'),
        }),
      );

      const where = lifecycleBuilder.calls['where']![0]![0] as Record<
        string,
        unknown
      >;

      expect(
        inRange(
          where['resolvedAt'],
          '2024-09-01T00:00:00Z',
          '2024-10-01T00:00:00Z',
        ),
      ).toBe(true);
      expect(where).not.toHaveProperty('createdAt');
      expect(where['handlerId']).toEqual(Not(IsNull()));
    });

    it('drops the automated account from the leaderboard', async () => {
      await service.handlerSummary(
        new PartialDateRange({
          startDate: new Date('2024-11-01T00:00:00Z'),
          endDate: new Date('2024-12-01T00:00:00Z'),
        }),
      );

      expect(lifecycleBuilder.calls['andWhere']).toHaveLength(1);

      const [condition, parameters] = lifecycleBuilder.calls['andWhere']![0]!;

      expect(condition).toMatch(/handler_id\s*!=\s*:systemUserId/);
      expect(parameters).toEqual({ systemUserId: SYSTEM_USER_ID });
    });

    it('groups by handler and ranks by ticket count', async () => {
      await service.handlerSummary(
        new PartialDateRange({
          startDate: new Date('2025-01-01T00:00:00Z'),
          endDate: new Date('2025-02-01T00:00:00Z'),
        }),
      );

      expect(lifecycleBuilder.calls['groupBy']![0]![0]).toMatch(/handler_id$/);
      expect(lifecycleBuilder.calls['orderBy']).toEqual([['total', 'DESC']]);
      expect(lifecycleBuilder.calls['addSelect']).toContainEqual([
        expect.stringMatching(/COUNT\(.*ticket_id\)/),
        'total',
      ]);
    });

    it('pages from the first row when no page is asked for', async () => {
      await service.handlerSummary(
        new PartialDateRange({
          startDate: new Date('2025-03-01T00:00:00Z'),
          endDate: new Date('2025-04-01T00:00:00Z'),
        }),
      );

      expect(lifecycleBuilder.calls['offset']).toEqual([[0]]);
      expect(lifecycleBuilder.calls['limit']).toEqual([[20]]);
    });

    it('offsets by whole pages when one is asked for', async () => {
      await service.handlerSummary(
        new PartialDateRange({
          startDate: new Date('2025-05-01T00:00:00Z'),
          endDate: new Date('2025-06-01T00:00:00Z'),
        }),
        { page: 3, limit: 10 },
      );

      expect(lifecycleBuilder.calls['offset']).toEqual([[20]]);
      expect(lifecycleBuilder.calls['limit']).toEqual([[10]]);
    });
  });

  describe('reporterSummary', () => {
    it('keeps the automated account in the reporter counts', async () => {
      await service.reporterSummary(
        new PartialDateRange({
          startDate: new Date('2025-07-01T00:00:00Z'),
          endDate: new Date('2025-08-01T00:00:00Z'),
        }),
      );

      const where = ticketBuilder.calls['where']![0]![0] as Record<
        string,
        unknown
      >;

      expect(where).not.toHaveProperty('creatorId');
      expect(ticketBuilder.calls['andWhere']).toBeUndefined();
    });

    it('counts tickets by the account that filed them, over their creation date', async () => {
      await service.reporterSummary(
        new PartialDateRange({
          startDate: new Date('2025-09-01T00:00:00Z'),
          endDate: new Date('2025-10-01T00:00:00Z'),
        }),
      );

      const where = ticketBuilder.calls['where']![0]![0] as Record<
        string,
        unknown
      >;

      expect(
        inRange(
          where['createdAt'],
          '2025-09-01T00:00:00Z',
          '2025-10-01T00:00:00Z',
        ),
      ).toBe(true);
      expect(ticketBuilder.calls['groupBy']).toEqual([['ticket.creator_id']]);
    });
  });

  describe('ageSummary', () => {
    it('selects on the creation date alone', async () => {
      await service.ageSummary(
        new PartialDateRange({
          startDate: new Date('2025-11-01T00:00:00Z'),
          endDate: new Date('2025-12-01T00:00:00Z'),
        }),
      );

      const where = (
        ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
      ).where as FindOptionsWhere<TicketEntity>;

      expect(Object.keys(where)).toEqual(['createdAt']);
    });

    it('ages an open ticket to now and a resolved one to its resolution', async () => {
      const now = new Date('2026-01-15T00:00:00Z');
      jest.useFakeTimers().setSystemTime(now);

      ticketFind.mockResolvedValue([
        new TicketEntity({
          id: 1,
          createdAt: new Date('2026-01-01T00:00:00Z'),
        }),
        new TicketEntity({
          id: 2,
          createdAt: new Date('2026-01-01T00:00:00Z'),
        }),
      ]);

      lifecycleFind.mockResolvedValue([
        { ticketId: 2, resolvedAt: new Date('2026-01-02T00:00:00Z') },
      ]);

      const summary = await service.ageSummary(
        new PartialDateRange({
          startDate: new Date('2026-01-01T00:00:00Z'),
          endDate: new Date('2026-02-01T00:00:00Z'),
        }),
      );

      expect(summary.oneDay).toBe(1);
      expect(summary.twoWeeks).toBe(1);

      jest.useRealTimers();
    });

    it('measures age in flat hours, so a daylight saving shift does not move it', async () => {
      const acrossTheShift = [
        new TicketEntity({
          id: 1,
          createdAt: new Date('2024-11-02T12:00:00Z'),
        }),
      ];

      lifecycleFind.mockResolvedValue([
        { ticketId: 1, resolvedAt: new Date('2024-11-03T12:00:00Z') },
      ]);

      ticketFind.mockResolvedValue(acrossTheShift);
      const inUtc = await service.ageSummary(
        new PartialDateRange({
          startDate: new Date('2024-11-01T00:00:00Z'),
          endDate: new Date('2024-12-01T00:00:00Z'),
          timezone: 'UTC',
        }),
      );

      ticketFind.mockResolvedValue(acrossTheShift);
      const inNewYork = await service.ageSummary(
        new PartialDateRange({
          startDate: new Date('2024-11-01T00:00:00Z'),
          endDate: new Date('2024-12-01T00:00:00Z'),
          timezone: 'America/New_York',
        }),
      );

      expect(inUtc.oneDay).toBe(1);
      expect(inNewYork).toEqual(inUtc);
    });
  });

  describe('createdSeries', () => {
    it('selects tickets by the date they were filed', async () => {
      await service.createdSeries(
        new PartialDateRange({
          startDate: new Date('2026-03-01T00:00:00Z'),
          endDate: new Date('2026-04-01T00:00:00Z'),
        }),
      );

      const where = (
        ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
      ).where as FindOptionsWhere<TicketEntity>;

      expect(
        inRange(
          where.createdAt,
          '2026-03-01T00:00:00Z',
          '2026-04-01T00:00:00Z',
        ),
      ).toBe(true);
    });
  });

  describe('openSeries', () => {
    it('admits tickets opened before the window and still open', async () => {
      await service.openSeries(
        new PartialDateRange({
          startDate: new Date('2026-05-01T00:00:00Z'),
          endDate: new Date('2026-06-01T00:00:00Z'),
        }),
      );

      const where = (
        ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
      ).where as FindOptionsWhere<TicketEntity>[];

      expect(where).toContainEqual({
        createdAt: expect.objectContaining({ type: 'lessThan' }),
        status: Not(TicketStatus.approved),
      });
      expect(where).toContainEqual({
        createdAt: expect.objectContaining({ type: 'lessThan' }),
        updatedAt: expect.objectContaining({ type: 'moreThan' }),
      });
    });
  });

  it('falls back to the current month when no range is given', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-20T12:00:00Z'));

    await service.createdSeries();

    const where = (
      ticketFind.mock.calls[0]![0] as FindManyOptions<TicketEntity>
    ).where as FindOptionsWhere<TicketEntity>;

    expect(
      inRange(where.createdAt, '2026-05-01T00:00:00Z', '2026-06-01T00:00:00Z'),
    ).toBe(true);

    jest.useRealTimers();
  });
});
