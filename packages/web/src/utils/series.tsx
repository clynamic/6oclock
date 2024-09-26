import { DateTime } from 'luxon';

export interface SeriesPoint {
  count: number;
  date: Date;
}

export type MergedSeriesPoint<T extends string> = { date: Date } & Record<
  T,
  number
>;

export const mergePointSeries = <T extends string>(
  seriesRecord: Record<T, SeriesPoint[]>,
  granularity: 'time' | 'date' = 'date',
): MergedSeriesPoint<T>[] => {
  const dateMap: Record<string, MergedSeriesPoint<T>> = {};

  const dateString = (date: Date) => {
    if (granularity === 'time') {
      return DateTime.fromJSDate(date).toISO()!;
    }
    return DateTime.fromJSDate(date).toISODate()!;
  };

  for (const [seriesName, points] of Object.entries(seriesRecord) as [
    T,
    SeriesPoint[],
  ][]) {
    for (const point of points) {
      const date = dateString(point.date);
      if (!dateMap[date]) {
        dateMap[date] = { date: point.date } as MergedSeriesPoint<T>;
      }
      for (const series of Object.keys(seriesRecord) as T[]) {
        if (dateMap[date][series] === undefined) {
          dateMap[date][series] = 0 as MergedSeriesPoint<T>[T];
        }
      }
      dateMap[date][seriesName] = (dateMap[date][seriesName] +
        point.count) as MergedSeriesPoint<T>[T];
    }
  }

  return Object.values(dateMap);
};
