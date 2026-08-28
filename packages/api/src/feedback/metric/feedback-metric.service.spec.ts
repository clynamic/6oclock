import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserFeedbackCategory } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange, TimeScale } from 'src/common';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';

import { FeedbackEntity } from '../feedback.entity';
import { FeedbackTypeQuery } from './feedback-metric.dto';
import { FeedbackMetricService } from './feedback-metric.service';

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

const feedback = (
  id: number,
  category: UserFeedbackCategory,
  iso: string,
): FeedbackEntity =>
  new FeedbackEntity({
    id,
    userId: 1,
    creatorId: 2,
    category,
    createdAt: at(iso),
  });

const week = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

describe('FeedbackMetricService', () => {
  let service: FeedbackMetricService;
  let find: jest.Mock;

  beforeEach(async () => {
    find = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        FeedbackMetricService,
        {
          provide: getRepositoryToken(FeedbackEntity),
          useValue: { find },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(FeedbackMetricService);
    await CacheManager.getInstance().clear();
  });

  const whereOf = (): FindOptionsWhere<FeedbackEntity> =>
    (find.mock.calls[0]![0] as FindManyOptions<FeedbackEntity>)
      .where as FindOptionsWhere<FeedbackEntity>;

  it('selects feedback by the date it was given', async () => {
    await service.type(week('2024-01-01T00:00:00Z', '2024-01-04T00:00:00Z'));

    expect(
      inRange(
        whereOf().createdAt,
        '2024-01-01T00:00:00Z',
        '2024-01-04T00:00:00Z',
      ),
    ).toBe(true);
    expect(Object.keys(whereOf())).toEqual(['createdAt']);
  });

  it('narrows to the author and the subject when asked for them', async () => {
    await service.type(
      week('2024-02-01T00:00:00Z', '2024-02-04T00:00:00Z'),
      new FeedbackTypeQuery({ creatorId: 10, userId: 20 }),
    );

    expect(whereOf()).toMatchObject({ creatorId: 10, userId: 20 });
  });

  it('reports all three categories in every bucket, at zero where absent', async () => {
    find.mockResolvedValue([
      feedback(1, UserFeedbackCategory.positive, '2024-03-01T01:00:00Z'),
      feedback(2, UserFeedbackCategory.negative, '2024-03-03T01:00:00Z'),
    ]);

    const points = await service.type(
      week('2024-03-01T00:00:00Z', '2024-03-04T00:00:00Z'),
    );

    expect(
      points.map(({ negative, neutral, positive }) => ({
        negative,
        neutral,
        positive,
      })),
    ).toEqual([
      { negative: 0, neutral: 0, positive: 1 },
      { negative: 0, neutral: 0, positive: 0 },
      { negative: 1, neutral: 0, positive: 0 },
    ]);
  });

  it('counts feedback of a category it does not report in no bucket at all', async () => {
    find.mockResolvedValue([
      feedback(
        1,
        'commendation' as UserFeedbackCategory,
        '2024-04-01T01:00:00Z',
      ),
    ]);

    const points = await service.type(
      week('2024-04-01T00:00:00Z', '2024-04-04T00:00:00Z'),
    );

    expect(
      points.map((point) => point.negative + point.neutral + point.positive),
    ).toEqual([0, 0, 0]);
  });
});
