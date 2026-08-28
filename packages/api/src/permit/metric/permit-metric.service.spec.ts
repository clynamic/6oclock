import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';

import { PermitEntity } from '../permit.entity';
import { PermitMetricService } from './permit-metric.service';

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

describe('PermitMetricService', () => {
  let service: PermitMetricService;
  let find: jest.Mock;

  beforeEach(async () => {
    find = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        PermitMetricService,
        {
          provide: getRepositoryToken(PermitEntity),
          useValue: { find },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PermitMetricService);
    await CacheManager.getInstance().clear();
  });

  it('selects permits granted inside the window and nothing else', async () => {
    await service.count(week('2024-01-01T00:00:00Z', '2024-01-04T00:00:00Z'));

    const where = (find.mock.calls[0]![0] as FindManyOptions<PermitEntity>)
      .where as FindOptionsWhere<PermitEntity>;

    expect(
      inRange(where.createdAt, '2024-01-01T00:00:00Z', '2024-01-04T00:00:00Z'),
    ).toBe(true);
    expect(Object.keys(where)).toEqual(['createdAt']);
  });

  it('counts each permit on the day it was granted', async () => {
    find.mockResolvedValue([
      new PermitEntity({ id: 1, createdAt: at('2024-02-01T01:00:00Z') }),
      new PermitEntity({ id: 2, createdAt: at('2024-02-01T23:00:00Z') }),
      new PermitEntity({ id: 3, createdAt: at('2024-02-03T01:00:00Z') }),
    ]);

    const series = await service.count(
      week('2024-02-01T00:00:00Z', '2024-02-04T00:00:00Z'),
    );

    expect(series.map((point) => point.value)).toEqual([2, 0, 1]);
  });
});
