import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { CursorParams, DateRange, PartialDateRange } from 'src/common';

import { TileSlice } from './tile-health.dto';

/** Marks across the reach, enough to see the shape of a run of tiles. */
const SLICE_COUNT = 60;

const HOUR = 60 * 60 * 1000;

export interface TileCoverage {
  ranges: { startDate: Date; endDate: Date }[];
  missing: Date[];
  interval: number;
  reach: DateRange;
}

const readBucket = (
  start: number,
  end: number,
  ranges: { startDate: Date; endDate: Date }[],
  missed: number[],
  interval: number,
): TileSlice => {
  const owed =
    ranges.reduce(
      (sum, range) =>
        sum +
        Math.max(
          0,
          Math.min(end, range.endDate.getTime()) -
            Math.max(start, range.startDate.getTime()),
        ),
      0,
    ) /
    (HOUR * interval);

  // A tile can straddle two marks, which share the hole between them.
  const unavailable =
    missed.reduce(
      (sum, time) =>
        sum +
        Math.max(
          0,
          Math.min(end, time + HOUR * interval) - Math.max(start, time),
        ),
      0,
    ) /
    (HOUR * interval);

  return new TileSlice({
    startDate: new Date(start),
    endDate: new Date(end),
    available: Math.max(0, owed - unavailable),
    unavailable,
    none: Math.max(0, (end - start) / (HOUR * interval) - owed),
  });
};

const sortedMissing = (missing: Date[]): number[] =>
  missing.map((time) => time.getTime()).sort((a, b) => a - b);

/**
 * Split the reach into marks, each carrying what that stretch owes and holds.
 */
export const readTileSlices = ({
  ranges,
  missing,
  interval,
  reach,
}: TileCoverage): TileSlice[] => {
  const reachStart = reach.startDate.getTime();
  const span = reach.endDate.getTime() - reachStart;

  // A mark narrower than a tile cannot say anything a tile does not.
  const count = Math.max(
    1,
    Math.min(SLICE_COUNT, Math.floor(span / (HOUR * interval))),
  );

  const width = span / count;
  const missed = sortedMissing(missing);

  return Array.from({ length: count }, (_, index) =>
    readBucket(
      reachStart + index * width,
      reachStart + (index + 1) * width,
      ranges,
      missed,
      interval,
    ),
  );
};

/**
 * The same accounting over calendar months, which is the unit tiles are
 * deleted in.
 */
export const readTileMonths = ({
  ranges,
  missing,
  interval,
  reach,
  before,
  limit = CursorParams.DEFAULT_PAGE_SIZE,
  range,
}: TileCoverage & {
  before?: Date;
  limit?: number;
  range?: PartialDateRange;
}): TileSlice[] => {
  const missed = sortedMissing(missing);
  const months: TileSlice[] = [];

  const floor = range?.startDate
    ? new Date(Math.max(reach.startDate.getTime(), range.startDate.getTime()))
    : reach.startDate;

  const ceiling = range?.endDate
    ? new Date(Math.min(reach.endDate.getTime(), range.endDate.getTime()))
    : reach.endDate;

  const oldest = startOfMonth(floor);

  let cursor = before
    ? subMonths(startOfMonth(before), 1)
    : startOfMonth(ceiling);

  while (months.length < limit && cursor >= oldest) {
    months.push(
      readBucket(
        cursor.getTime(),
        addMonths(cursor, 1).getTime(),
        ranges,
        missed,
        interval,
      ),
    );

    cursor = subMonths(cursor, 1);
  }

  return months;
};
