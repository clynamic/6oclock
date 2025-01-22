import { SeriesCountPoint } from '../api';

export type SeriesRecordPoint<T extends string> = { date: Date } & Record<
  T,
  number
>;

export const mergePointSeries = <T extends string>(
  seriesRecord: Record<T, SeriesCountPoint[]>,
): SeriesRecordPoint<T>[] => {
  const result: Record<string, SeriesRecordPoint<T>> = {};

  for (const [seriesName, points] of Object.entries(seriesRecord) as [
    T,
    SeriesCountPoint[],
  ][]) {
    for (const point of points) {
      const key = point.date.toISOString();
      if (!result[key]) {
        result[key] = { date: point.date } as SeriesRecordPoint<T>;
      }
      for (const series of Object.keys(seriesRecord) as T[]) {
        if (result[key][series] === undefined) {
          result[key][series] = 0 as SeriesRecordPoint<T>[T];
        }
      }
      result[key][seriesName] = (result[key][seriesName] +
        point.value) as SeriesRecordPoint<T>[T];
    }
  }

  return Object.values(result);
};

export const addToMergedSeries = <O extends string, T extends string>(
  mergedSeries: SeriesRecordPoint<O>[],
  seriesName: T,
  seriesRecord: SeriesCountPoint[],
): SeriesRecordPoint<O | T>[] => {
  const result: Record<string, SeriesRecordPoint<O | T>> = {};

  for (const point of mergedSeries) {
    const key = point.date.toISOString();
    result[key] = { ...point } as SeriesRecordPoint<O | T>;
  }

  for (const point of seriesRecord) {
    const key = point.date.toISOString();
    if (!result[key]) {
      result[key] = { date: point.date } as SeriesRecordPoint<O | T>;
    }
    (result[key] as Record<string, number>)[seriesName] =
      ((result[key][seriesName] as number | undefined) || 0) + point.value;

    for (const existingKey of Object.keys(result[key]) as (O | T)[]) {
      if (existingKey !== 'date' && result[key][existingKey] === undefined) {
        (result[key] as Record<string, number>)[existingKey] = 0;
      }
    }
  }

  return Object.values(result);
};

export const flattenPointSeries = <T extends string>(
  series: SeriesRecordPoint<T>[],
): SeriesCountPoint[] => {
  const result: SeriesCountPoint[] = [];

  for (const point of series) {
    const value = Object.values(point).reduce(
      (acc, v) => (typeof v === 'number' ? acc + v : acc),
      0,
    );
    result.push({ date: point.date, value });
  }

  return result;
};

export const isPointSeriesEmpty = <T extends string>(
  series: SeriesRecordPoint<T>[],
): boolean => {
  return series.every((point) =>
    Object.values(point).every((v) => v instanceof Date || v === 0),
  );
};
