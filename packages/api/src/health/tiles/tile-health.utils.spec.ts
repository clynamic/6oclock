import { DateRange, PartialDateRange } from 'src/common';

import { readTileMonths, readTileSlices } from './tile-health.utils';

const at = (value: string): Date => new Date(value);

const spanning = (
  startDate: string,
  endDate: string,
): { startDate: Date; endDate: Date } => ({
  startDate: at(startDate),
  endDate: at(endDate),
});

const reaching = (startDate: string, endDate: string): DateRange =>
  new DateRange({ startDate: at(startDate), endDate: at(endDate) });

describe('marking the shape of a run of tiles', () => {
  it('never draws a mark narrower than a tile', () => {
    const slices = readTileSlices({
      ranges: [spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z')],
      missing: [],
      interval: 1,
      reach: reaching('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
    });

    expect(slices).toHaveLength(6);
  });

  it('draws the ceiling of marks once the reach is wide enough', () => {
    const slices = readTileSlices({
      ranges: [spanning('2024-03-01T00:00:00Z', '2024-06-01T00:00:00Z')],
      missing: [],
      interval: 1,
      reach: reaching('2024-03-01T00:00:00Z', '2024-06-01T00:00:00Z'),
    });

    expect(slices).toHaveLength(60);
  });

  it('accounts a missing hour once across every mark it touches', () => {
    const slices = readTileSlices({
      ranges: [spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z')],
      missing: [at('2024-03-01T02:00:00Z')],
      interval: 1,
      reach: reaching('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
    });

    const owed = slices.reduce((sum, slice) => sum + slice.unavailable, 0);
    const held = slices.reduce((sum, slice) => sum + slice.available, 0);

    expect(owed).toBe(1);
    expect(held).toBe(5);
  });

  it('owes nothing for a stretch no range covers', () => {
    const slices = readTileSlices({
      ranges: [spanning('2024-03-01T00:00:00Z', '2024-03-01T03:00:00Z')],
      missing: [],
      interval: 1,
      reach: reaching('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
    });

    const last = slices[slices.length - 1]!;

    expect(last.unavailable).toBe(0);
    expect(last.none).toBeGreaterThan(0);
  });
});

describe('reading tiles by the month', () => {
  const coverage = {
    ranges: [spanning('2024-01-01T00:00:00Z', '2024-06-01T00:00:00Z')],
    missing: [],
    interval: 1,
    reach: reaching('2024-01-01T00:00:00Z', '2024-06-01T00:00:00Z'),
  };

  it('starts at the newest month the reach touches', () => {
    const months = readTileMonths(coverage);

    expect(months[0]!.startDate).toEqual(at('2024-06-01T00:00:00Z'));
  });

  it('walks backwards a month at a time', () => {
    const months = readTileMonths(coverage);

    expect(months[1]!.startDate).toEqual(at('2024-05-01T00:00:00Z'));
  });

  it('reads no more months than the page allows', () => {
    expect(readTileMonths({ ...coverage, limit: 2 })).toHaveLength(2);
  });

  it('picks up beneath the month the marker names', () => {
    const months = readTileMonths({
      ...coverage,
      before: at('2024-05-01T00:00:00Z'),
      limit: 1,
    });

    expect(months[0]!.startDate).toEqual(at('2024-04-01T00:00:00Z'));
  });

  it('stops at the oldest month the reach touches', () => {
    const months = readTileMonths({ ...coverage, limit: 50 });

    expect(months[months.length - 1]!.startDate).toEqual(
      at('2024-01-01T00:00:00Z'),
    );
  });

  it('starts no later than a named end', () => {
    const months = readTileMonths({
      ...coverage,
      range: new PartialDateRange({ endDate: at('2024-03-15T00:00:00Z') }),
    });

    expect(months[0]!.startDate).toEqual(at('2024-03-01T00:00:00Z'));
  });

  it('stops at a named start', () => {
    const months = readTileMonths({
      ...coverage,
      range: new PartialDateRange({ startDate: at('2024-04-10T00:00:00Z') }),
    });

    expect(months[months.length - 1]!.startDate).toEqual(
      at('2024-04-01T00:00:00Z'),
    );
  });
});
