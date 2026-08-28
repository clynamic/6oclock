import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { FindManyOptions, FindOptionsWhere, IsNull } from 'typeorm';

import {
  FlagHandling,
  FlagLifecycleEntity,
} from '../lifecycle/flag-lifecycle.entity';
import { FlagHandledQuery } from './flag-metric.dto';
import { FlagMetricService } from './flag-metric.service';

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

const episode = (partial: Partial<FlagLifecycleEntity>): FlagLifecycleEntity =>
  new FlagLifecycleEntity({
    postId: 1,
    flaggedAt: at('2024-01-01T00:00:00Z'),
    handledAt: null,
    handlerId: null,
    handling: null,
    ...partial,
  });

const week = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

describe('FlagMetricService', () => {
  let service: FlagMetricService;
  let lifecycleFind: jest.Mock;

  beforeEach(async () => {
    lifecycleFind = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        FlagMetricService,
        {
          provide: getRepositoryToken(PostEventEntity),
          useValue: { query: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getRepositoryToken(FlagLifecycleEntity),
          useValue: { find: lifecycleFind },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(FlagMetricService);
    await CacheManager.getInstance().clear();
  });

  describe('handled', () => {
    it('selects episodes by the date they were handled', async () => {
      await service.handled(
        week('2024-01-01T00:00:00Z', '2024-01-04T00:00:00Z'),
      );

      const options = lifecycleFind.mock
        .calls[0]![0] as FindManyOptions<FlagLifecycleEntity>;
      const where = options.where as FindOptionsWhere<FlagLifecycleEntity>;

      expect(
        inRange(
          where.handledAt,
          '2024-01-01T00:00:00Z',
          '2024-01-04T00:00:00Z',
        ),
      ).toBe(true);
      expect(new Set(options.select as string[])).toEqual(
        new Set(['handledAt', 'handling']),
      );
    });

    it('narrows to one handler when asked for one', async () => {
      await service.handled(
        week('2024-02-01T00:00:00Z', '2024-02-04T00:00:00Z'),
        new FlagHandledQuery({ userId: 500 }),
      );

      const where = (
        lifecycleFind.mock.calls[0]![0] as FindManyOptions<FlagLifecycleEntity>
      ).where as FindOptionsWhere<FlagLifecycleEntity>;

      expect(where.handlerId).toBe(500);
    });

    it('reports both outcomes in every bucket, at zero where absent', async () => {
      lifecycleFind.mockResolvedValue([
        episode({
          handledAt: at('2024-03-01T01:00:00Z'),
          handling: FlagHandling.removed,
        }),
        episode({
          handledAt: at('2024-03-03T01:00:00Z'),
          handling: FlagHandling.deleted,
        }),
      ]);

      const points = await service.handled(
        week('2024-03-01T00:00:00Z', '2024-03-04T00:00:00Z'),
      );

      expect(
        points.map(({ removed, deleted }) => ({ removed, deleted })),
      ).toEqual([
        { removed: 1, deleted: 0 },
        { removed: 0, deleted: 0 },
        { removed: 0, deleted: 1 },
      ]);
    });
  });

  describe('status', () => {
    it('admits episodes opened, handled, or opened before the window and still open', async () => {
      await service.status(
        week('2024-04-01T00:00:00Z', '2024-04-04T00:00:00Z'),
      );

      const where = (
        lifecycleFind.mock.calls[0]![0] as FindManyOptions<FlagLifecycleEntity>
      ).where as FindOptionsWhere<FlagLifecycleEntity>[];

      const opened = where.find(
        (clause) => 'flaggedAt' in clause && !('handledAt' in clause),
      )!;
      const handled = where.find((clause) => 'handledAt' in clause)!;

      expect(where).toHaveLength(3);
      expect(
        inRange(
          opened.flaggedAt,
          '2024-04-01T00:00:00Z',
          '2024-04-04T00:00:00Z',
        ),
      ).toBe(true);
      expect(
        inRange(
          handled.handledAt,
          '2024-04-01T00:00:00Z',
          '2024-04-04T00:00:00Z',
        ),
      ).toBe(true);
      expect(where).toContainEqual({
        flaggedAt: expect.objectContaining({ type: 'lessThan' }),
        handledAt: IsNull(),
      });
    });

    it('counts an unhandled episode as open', async () => {
      lifecycleFind.mockResolvedValue([
        episode({ flaggedAt: at('2024-05-01T01:00:00Z'), handledAt: null }),
      ]);

      const points = await service.status(
        week('2024-05-01T00:00:00Z', '2024-05-04T00:00:00Z'),
      );

      expect(points.map((point) => point.open)).toEqual([1, 0, 0]);
    });

    it('counts a handled episode under the way it was handled', async () => {
      lifecycleFind.mockResolvedValue([
        episode({
          flaggedAt: at('2024-06-01T01:00:00Z'),
          handledAt: at('2024-06-02T01:00:00Z'),
          handling: FlagHandling.deleted,
        }),
      ]);

      const points = await service.status(
        week('2024-06-01T00:00:00Z', '2024-06-04T00:00:00Z'),
      );

      expect(points.map((point) => point.deleted)).toEqual([1, 0, 0]);
    });

    it('clamps an episode opened before the window into its first bucket', async () => {
      lifecycleFind.mockResolvedValue([
        episode({ flaggedAt: at('2024-06-20T00:00:00Z'), handledAt: null }),
      ]);

      const points = await service.status(
        week('2024-07-01T00:00:00Z', '2024-07-04T00:00:00Z'),
      );

      expect(points.map((point) => point.open)).toEqual([1, 0, 0]);
    });

    it('reports open, removed and deleted in every bucket', async () => {
      const points = await service.status(
        week('2024-08-01T00:00:00Z', '2024-08-04T00:00:00Z'),
      );

      expect(Object.keys(points[0]!).sort()).toEqual([
        'date',
        'deleted',
        'open',
        'removed',
      ]);
    });
  });
});
