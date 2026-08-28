import {
  DateRange,
  PartialDateRange,
  TimeScale,
  getClosestTimeScale,
  getDurationKeyForScale,
  inferDefaultScale,
  inferScaleForCycle,
} from './date-range.dto';

const iso = (date: Date): string => new Date(date.getTime()).toISOString();

const days = (count: number): number => count * 24 * 60 * 60 * 1000;

const spanning = (
  milliseconds: number,
): { startDate: Date; endDate: Date } => ({
  startDate: new Date('2024-01-01T00:00:00Z'),
  endDate: new Date(new Date('2024-01-01T00:00:00Z').getTime() + milliseconds),
});

describe('getClosestTimeScale', () => {
  it.each([
    [days(1) / 1440, TimeScale.Minute],
    [days(1) / 24, TimeScale.Hour],
    [days(1), TimeScale.Day],
    [days(7), TimeScale.Week],
    [days(30), TimeScale.Month],
    [days(365), TimeScale.Year],
    [days(3650), TimeScale.Decade],
  ])('reads a span of %s ms as %s', (milliseconds, scale) => {
    expect(getClosestTimeScale(spanning(milliseconds))).toBe(scale);
  });

  it('gives up on a span longer than a decade and calls it all', () => {
    expect(getClosestTimeScale(spanning(days(4000)))).toBe(TimeScale.All);
  });
});

describe('getDurationKeyForScale', () => {
  it.each([
    [TimeScale.Minute, 'minutes'],
    [TimeScale.Hour, 'hours'],
    [TimeScale.Day, 'days'],
    [TimeScale.Week, 'weeks'],
    [TimeScale.Month, 'months'],
    [TimeScale.Year, 'years'],
    [TimeScale.Decade, 'years'],
    [TimeScale.All, 'years'],
  ])('measures %s in %s', (scale, duration) => {
    expect(getDurationKeyForScale(scale)).toBe(duration);
  });
});

describe('inferScaleForCycle', () => {
  it.each([
    [TimeScale.Hour, TimeScale.Minute],
    [TimeScale.Day, TimeScale.Hour],
    [TimeScale.Week, TimeScale.Day],
    [TimeScale.Month, TimeScale.Week],
    [TimeScale.Year, TimeScale.Month],
    [TimeScale.Decade, TimeScale.Year],
  ])('buckets a %s cycle by %s', (cycle, scale) => {
    expect(inferScaleForCycle(cycle)).toBe(scale);
  });

  it('has no scale below a minute cycle', () => {
    expect(inferScaleForCycle(TimeScale.Minute)).toBeUndefined();
  });

  it('has no sensible scale for an all cycle or an absent one', () => {
    expect(inferScaleForCycle(TimeScale.All)).toBeUndefined();
    expect(inferScaleForCycle(undefined)).toBeUndefined();
  });
});

describe('inferDefaultScale', () => {
  it('lets the cycle decide, whatever the span', () => {
    expect(
      inferDefaultScale({
        startDate: new Date('2020-01-01T00:00:00Z'),
        endDate: new Date('2024-01-01T00:00:00Z'),
        cycle: TimeScale.Day,
      }),
    ).toBe(TimeScale.Hour);
  });

  it('falls back to days when neither end is given', () => {
    expect(
      inferDefaultScale({} as Parameters<typeof inferDefaultScale>[0]),
    ).toBe(TimeScale.Day);
  });

  it.each([
    [days(1) / 24, TimeScale.Minute],
    [days(2), TimeScale.Hour],
    [days(10), TimeScale.Day],
    [days(45), TimeScale.Week],
    [days(200), TimeScale.Month],
    [days(1000), TimeScale.Year],
    [days(5000), TimeScale.Decade],
  ])('buckets a span of %s ms by %s', (milliseconds, scale) => {
    expect(inferDefaultScale(spanning(milliseconds))).toBe(scale);
  });
});

describe('PartialDateRange', () => {
  describe('find', () => {
    it('holds the start inclusive and the end exclusive', () => {
      const operator = new PartialDateRange({
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-02-01T00:00:00Z'),
      }).find()!;

      expect(operator.type).toBe('and');
      const [after, before] = operator.value as unknown as [
        { type: string; value: Date },
        { type: string; value: Date },
      ];
      expect(after.type).toBe('moreThanOrEqual');
      expect(iso(after.value)).toBe('2024-01-01T00:00:00.000Z');
      expect(before.type).toBe('lessThan');
      expect(iso(before.value)).toBe('2024-02-01T00:00:00.000Z');
    });

    it('leaves an open end when only a start is given', () => {
      const operator = new PartialDateRange({
        startDate: new Date('2024-01-01T00:00:00Z'),
      }).find()!;

      expect(operator.type).toBe('moreThanOrEqual');
    });

    it('leaves an open start when only an end is given', () => {
      const operator = new PartialDateRange({
        endDate: new Date('2024-02-01T00:00:00Z'),
      }).find()!;

      expect(operator.type).toBe('lessThan');
    });

    it('constrains nothing when neither end is given', () => {
      expect(new PartialDateRange({}).find()).toBeUndefined();
    });
  });

  describe('where', () => {
    it('applies the range to the creation date', () => {
      const where = new PartialDateRange({
        startDate: new Date('2024-01-01T00:00:00Z'),
      }).where()!;

      expect(Object.keys(where)).toEqual(['createdAt']);
      expect(where.createdAt).toBeDefined();
    });
  });

  describe('toE621RangeString', () => {
    it('widens by a day at each end, since e621 reads both bounds as exclusive', () => {
      expect(
        new PartialDateRange({
          startDate: new Date('2024-01-10T00:00:00Z'),
          endDate: new Date('2024-01-20T00:00:00Z'),
        }).toE621RangeString(),
      ).toBe('2024-01-09..2024-01-21');
    });

    it('writes an open end as a greater-than', () => {
      expect(
        new PartialDateRange({
          startDate: new Date('2024-01-10T00:00:00Z'),
        }).toE621RangeString(),
      ).toBe('>2024-01-09');
    });

    it('writes an open start as a less-than', () => {
      expect(
        new PartialDateRange({
          endDate: new Date('2024-01-20T00:00:00Z'),
        }).toE621RangeString(),
      ).toBe('<2024-01-21');
    });

    it('writes nothing for a range with neither end', () => {
      expect(new PartialDateRange({}).toE621RangeString()).toBe('');
    });
  });
});

describe('DateRange', () => {
  it('defaults to UTC, an all cycle and a scale read off the span', () => {
    const range = new DateRange({
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-11T00:00:00Z'),
    });

    expect(range.timezone).toBe('UTC');
    expect(range.cycle).toBe(TimeScale.All);
    expect(range.scale).toBe(TimeScale.Day);
  });

  describe('fill', () => {
    it('runs a start-only range to the start of the following month', () => {
      const range = DateRange.fill({
        startDate: new Date('2024-03-15T00:00:00Z'),
      });

      expect(iso(range.startDate)).toBe('2024-03-15T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-04-01T00:00:00.000Z');
    });

    it('runs an end-only range back to the start of its own month', () => {
      const range = DateRange.fill({
        endDate: new Date('2024-03-15T00:00:00Z'),
      });

      expect(iso(range.startDate)).toBe('2024-03-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-03-15T00:00:00.000Z');
    });

    it('falls back to the current month when neither end is given', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-15T12:34:56Z'));

      const range = DateRange.fill();

      expect(iso(range.startDate)).toBe('2024-06-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-07-01T00:00:00.000Z');

      jest.useRealTimers();
    });

    it('keeps a scale the caller asked for', () => {
      const range = DateRange.fill({
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-11T00:00:00Z'),
        scale: TimeScale.Hour,
      });

      expect(range.scale).toBe(TimeScale.Hour);
    });
  });

  describe('recentMonths', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-15T12:34:56Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('counts back whole months and runs to the end of the current one', () => {
      const range = DateRange.recentMonths(3);

      expect(iso(range.startDate)).toBe('2024-03-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-07-01T00:00:00.000Z');
    });

    it('covers one month more than it is asked for, the current one', () => {
      const range = DateRange.recentMonths(0);

      expect(iso(range.startDate)).toBe('2024-06-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-07-01T00:00:00.000Z');
    });

    it('defaults to twelve months back', () => {
      const range = DateRange.recentMonths();

      expect(iso(range.startDate)).toBe('2023-06-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-07-01T00:00:00.000Z');
    });

    it('crosses the year boundary backwards', () => {
      jest.setSystemTime(new Date('2024-02-10T00:00:00Z'));

      const range = DateRange.recentMonths(3);

      expect(iso(range.startDate)).toBe('2023-11-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-03-01T00:00:00.000Z');
    });

    it('gives the current month alone', () => {
      const range = DateRange.currentMonth();

      expect(iso(range.startDate)).toBe('2024-06-01T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-07-01T00:00:00.000Z');
    });
  });

  describe('expand', () => {
    it('pushes both ends out by the amount asked for', () => {
      const range = new DateRange({
        startDate: new Date('2024-03-10T00:00:00Z'),
        endDate: new Date('2024-03-20T00:00:00Z'),
      }).expand(TimeScale.Day, 2);

      expect(iso(range.startDate)).toBe('2024-03-08T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-03-22T00:00:00.000Z');
    });

    it('pushes out by one unit when no amount is given', () => {
      const range = new DateRange({
        startDate: new Date('2024-03-10T00:00:00Z'),
        endDate: new Date('2024-03-20T00:00:00Z'),
      }).expand(TimeScale.Month);

      expect(iso(range.startDate)).toBe('2024-02-10T00:00:00.000Z');
      expect(iso(range.endDate)).toBe('2024-04-20T00:00:00.000Z');
    });
  });

  describe('hoursOnly', () => {
    it('covers one whole day at hour scale', () => {
      const range = DateRange.hoursOnly('UTC');

      expect(range.scale).toBe(TimeScale.Hour);
      expect(range.endDate.getTime() - range.startDate.getTime()).toBe(days(1));
    });
  });
});
