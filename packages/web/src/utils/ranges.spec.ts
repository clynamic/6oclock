import { describe, expect, it } from 'vitest';

import { TimeScale } from '../api';
import {
  TimeDuration,
  addPeriods,
  formatRangeLabel,
  inferDurationFromRange,
  inferScaleFromRange,
  isInPeriod,
  startOfPeriod,
  subPeriods,
  unitFromDuration,
} from './ranges';

const at = (iso: string): Date => new Date(iso);

const spanning = (startIso: string, endIso: string): TimeScale =>
  inferScaleFromRange(at(startIso), at(endIso));

describe('inferScaleFromRange', () => {
  it('draws minutes for a span of two hours', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2024-03-01T02:00:00Z')).toBe(
      TimeScale.minute,
    );
  });

  it('steps up to hours once the span passes two hours', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2024-03-01T02:00:01Z')).toBe(
      TimeScale.hour,
    );
  });

  it('draws hours for a span of two days', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2024-03-03T00:00:00Z')).toBe(
      TimeScale.hour,
    );
  });

  it('steps up to days once the span passes two days', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2024-03-03T00:00:01Z')).toBe(
      TimeScale.day,
    );
  });

  it('steps up to weeks once the span passes thirty three days', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2024-04-03T00:00:01Z')).toBe(
      TimeScale.week,
    );
  });

  it('steps up to months once the span passes sixty days', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2024-04-30T00:00:01Z')).toBe(
      TimeScale.month,
    );
  });

  it('steps up to years once the span passes two years', () => {
    expect(spanning('2024-03-01T00:00:00Z', '2026-03-01T00:00:01Z')).toBe(
      TimeScale.year,
    );
  });

  it('draws decades for a span past ten years', () => {
    expect(spanning('2000-01-01T00:00:00Z', '2011-01-01T00:00:00Z')).toBe(
      TimeScale.decade,
    );
  });

  it('reads a backwards range the same as a forwards one', () => {
    expect(spanning('2024-03-03T00:00:00Z', '2024-03-01T00:00:00Z')).toBe(
      spanning('2024-03-01T00:00:00Z', '2024-03-03T00:00:00Z'),
    );
  });
});

describe('inferDurationFromRange', () => {
  const duration = (startIso: string, endIso: string): TimeDuration =>
    inferDurationFromRange(at(startIso), at(endIso));

  it('calls a single day a day', () => {
    expect(duration('2024-03-01T00:00:00Z', '2024-03-02T00:00:00Z')).toBe(
      TimeDuration.Day,
    );
  });

  it('calls eight days a week, and nine a month', () => {
    expect(duration('2024-03-01T00:00:00Z', '2024-03-09T00:00:00Z')).toBe(
      TimeDuration.Week,
    );
    expect(duration('2024-03-01T00:00:00Z', '2024-03-10T00:00:00Z')).toBe(
      TimeDuration.Month,
    );
  });

  it('calls thirty two days a month, and thirty three a year', () => {
    expect(duration('2024-03-01T00:00:00Z', '2024-04-02T00:00:00Z')).toBe(
      TimeDuration.Month,
    );
    expect(duration('2024-03-01T00:00:00Z', '2024-04-03T00:00:00Z')).toBe(
      TimeDuration.Year,
    );
  });
});

describe('walking a period', () => {
  it('names the unit each duration steps by', () => {
    expect(unitFromDuration(TimeDuration.Day)).toBe('day');
    expect(unitFromDuration(TimeDuration.Week)).toBe('week');
    expect(unitFromDuration(TimeDuration.Month)).toBe('month');
    expect(unitFromDuration(TimeDuration.Year)).toBe('year');
  });

  it('lands on the first instant of the period it is given', () => {
    expect(startOfPeriod(at('2024-03-15T13:45:00Z'), 'month')).toEqual(
      at('2024-03-01T00:00:00Z'),
    );
    expect(startOfPeriod(at('2024-03-15T13:45:00Z'), 'year')).toEqual(
      at('2024-01-01T00:00:00Z'),
    );
  });

  it('steps forward by whole periods', () => {
    expect(addPeriods(at('2024-01-31T00:00:00Z'), 'month', 1)).toEqual(
      at('2024-02-29T00:00:00Z'),
    );
  });

  it('steps back by whole periods, undoing a step forward', () => {
    const start = at('2024-03-15T00:00:00Z');

    expect(subPeriods(addPeriods(start, 'month', 3), 'month', 3)).toEqual(
      start,
    );
  });

  it('holds a date inside the period containing the reference', () => {
    expect(
      isInPeriod(
        at('2024-03-20T00:00:00Z'),
        at('2024-03-01T00:00:00Z'),
        'month',
      ),
    ).toBe(true);
  });

  it('shuts a date out of the period before it starts', () => {
    expect(
      isInPeriod(
        at('2024-02-28T00:00:00Z'),
        at('2024-03-01T00:00:00Z'),
        'month',
      ),
    ).toBe(false);
  });

  it('shuts a date out on the first instant of the next period', () => {
    expect(
      isInPeriod(
        at('2024-04-01T00:00:00Z'),
        at('2024-03-01T00:00:00Z'),
        'month',
      ),
    ).toBe(false);
  });

  it('holds the very first instant of the period itself', () => {
    expect(
      isInPeriod(
        at('2024-03-01T00:00:00Z'),
        at('2024-03-15T00:00:00Z'),
        'month',
      ),
    ).toBe(true);
  });
});

describe('formatRangeLabel', () => {
  it('names a whole month by its name, since the range covers exactly it', () => {
    expect(
      formatRangeLabel(
        at('2024-03-01T00:00:00Z'),
        at('2024-04-01T00:00:00Z'),
        TimeDuration.Month,
      ),
    ).toBe('March 2024');
  });

  it('names a whole year by its number', () => {
    expect(
      formatRangeLabel(
        at('2024-01-01T00:00:00Z'),
        at('2025-01-01T00:00:00Z'),
        TimeDuration.Year,
      ),
    ).toBe('2024');
  });

  it('reads the end exclusively, so a week label stops the day before', () => {
    expect(
      formatRangeLabel(
        at('2024-03-04T00:00:00Z'),
        at('2024-03-11T00:00:00Z'),
        TimeDuration.Week,
      ),
    ).toContain('March 10th');
  });

  it('spells out both years when a span crosses one', () => {
    expect(
      formatRangeLabel(
        at('2023-11-01T00:00:00Z'),
        at('2024-02-01T00:00:00Z'),
        TimeDuration.Month,
      ),
    ).toBe('Nov 2023 - Jan 2024');
  });

  it('leaves the year off the first half when both fall in one year', () => {
    expect(
      formatRangeLabel(
        at('2024-03-01T00:00:00Z'),
        at('2024-06-01T00:00:00Z'),
        TimeDuration.Month,
      ),
    ).toBe('Mar - May 2024');
  });
});
