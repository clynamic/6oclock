import { BadRequestException } from '@nestjs/common';

import {
  createTimeBuckets,
  generateSeriesCountPoints,
  generateSeriesLastTileCountPoints,
  generateSeriesRecordPoints,
  generateSeriesTileCountPoints,
} from './date-buckets';
import { DateRange, PartialDateRange, TimeScale } from './date-range.dto';

const fourDays = (
  overrides: Partial<PartialDateRange> = {},
): PartialDateRange =>
  new PartialDateRange({
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-05T00:00:00Z'),
    scale: TimeScale.Day,
    timezone: 'UTC',
    ...overrides,
  });

const bucketDates = (points: { date: Date }[]): string[] =>
  points.map((point) => new Date(point.date.getTime()).toISOString());

const bucketValues = <T>(points: { value: T }[]): T[] =>
  points.map((point) => point.value);

describe('createTimeBuckets', () => {
  it('opens a bucket on the start and none on the end', () => {
    const buckets = createTimeBuckets(DateRange.fill(fourDays()));

    expect(bucketDates(buckets.map((date) => ({ date })))).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-02T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z',
      '2024-01-04T00:00:00.000Z',
    ]);
  });

  describe('characterised, not specified', () => {
    it('cuts the window at the current time, leaving a future window empty', () => {
      const buckets = createTimeBuckets(
        DateRange.fill(
          fourDays({
            startDate: new Date('2999-01-01T00:00:00Z'),
            endDate: new Date('2999-01-05T00:00:00Z'),
          }),
        ),
      );

      expect(buckets).toEqual([]);
    });
  });
});

describe('generateSeriesCountPoints', () => {
  it('fills a bucket nothing landed in with zero rather than omitting it', () => {
    const points = generateSeriesCountPoints(
      [new Date('2024-01-02T05:00:00Z')],
      fourDays(),
    );

    expect(bucketDates(points)).toHaveLength(4);
    expect(bucketValues(points)).toEqual([0, 1, 0, 0]);
  });

  it('counts items sharing a day into that day', () => {
    const points = generateSeriesCountPoints(
      [
        new Date('2024-01-02T00:00:00Z'),
        new Date('2024-01-02T12:00:00Z'),
        new Date('2024-01-02T23:59:59Z'),
      ],
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([0, 3, 0, 0]);
  });

  it('skips an undefined date without shifting the items behind it', () => {
    const points = generateSeriesCountPoints(
      [undefined, new Date('2024-01-03T01:00:00Z')],
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([0, 0, 1, 0]);
  });

  it('counts a spanning range in every bucket it covers, end exclusive', () => {
    const points = generateSeriesCountPoints(
      [
        new DateRange({
          startDate: new Date('2024-01-02T00:00:00Z'),
          endDate: new Date('2024-01-04T00:00:00Z'),
        }),
      ],
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([0, 1, 1, 0]);
  });

  it('drops a range whose end precedes its start', () => {
    const points = generateSeriesCountPoints(
      [
        new DateRange({
          startDate: new Date('2024-01-03T00:00:00Z'),
          endDate: new Date('2024-01-02T00:00:00Z'),
        }),
      ],
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([0, 0, 0, 0]);
  });

  it('rejects a window asking for more buckets than the ceiling allows', () => {
    expect(() =>
      generateSeriesCountPoints(
        [],
        fourDays({
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-15T00:00:00Z'),
          scale: TimeScale.Minute,
        }),
      ),
    ).toThrow(BadRequestException);
  });
  describe('characterised, not specified', () => {
    it('throws for a date before the first bucket', () => {
      expect(() =>
        generateSeriesCountPoints(
          [new Date('2023-12-31T23:59:59Z')],
          fourDays(),
        ),
      ).toThrow(/No bucket found/);
    });

    it('folds a date after the last bucket into the last bucket', () => {
      const points = generateSeriesCountPoints(
        [new Date('2024-06-01T00:00:00Z')],
        fourDays(),
      );

      expect(bucketValues(points)).toEqual([0, 0, 0, 1]);
    });

    it('returns nothing for a window that has not begun', () => {
      const points = generateSeriesCountPoints(
        [],
        fourDays({
          startDate: new Date('2999-01-01T00:00:00Z'),
          endDate: new Date('2999-01-05T00:00:00Z'),
        }),
      );

      expect(points).toEqual([]);
    });
  });
});

describe('generateSeriesRecordPoints', () => {
  it('reports every key of allKeys in every bucket, at zero where absent', () => {
    const points = generateSeriesRecordPoints(
      [new Date('2024-01-01T01:00:00Z'), new Date('2024-01-03T01:00:00Z')],
      ['approved', 'denied'] as const,
      ['approved', 'denied', 'pending'] as const,
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([
      { approved: 1, denied: 0, pending: 0 },
      { approved: 0, denied: 0, pending: 0 },
      { approved: 0, denied: 1, pending: 0 },
      { approved: 0, denied: 0, pending: 0 },
    ]);
  });

  it('pairs each key with the date at the same index', () => {
    const points = generateSeriesRecordPoints(
      [new Date('2024-01-02T01:00:00Z'), new Date('2024-01-02T02:00:00Z')],
      ['approved', 'approved'] as const,
      ['approved', 'denied'] as const,
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([
      { approved: 0, denied: 0 },
      { approved: 2, denied: 0 },
      { approved: 0, denied: 0 },
      { approved: 0, denied: 0 },
    ]);
  });
});

describe('generateSeriesTileCountPoints', () => {
  it('sums the counts landing in a bucket', () => {
    const points = generateSeriesTileCountPoints(
      [
        new Date('2024-01-02T01:00:00Z'),
        new Date('2024-01-02T02:00:00Z'),
        new Date('2024-01-04T01:00:00Z'),
      ],
      [3, 4, 5],
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([0, 7, 0, 5]);
  });
});

describe('generateSeriesLastTileCountPoints', () => {
  it('takes the last count in a bucket and zero where the bucket is empty', () => {
    const points = generateSeriesLastTileCountPoints(
      [
        new Date('2024-01-02T01:00:00Z'),
        new Date('2024-01-02T02:00:00Z'),
        new Date('2024-01-04T01:00:00Z'),
      ],
      [3, 4, 5],
      fourDays(),
    );

    expect(bucketValues(points)).toEqual([0, 4, 0, 5]);
  });
});
