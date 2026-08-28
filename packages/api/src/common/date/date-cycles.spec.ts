import { generateSeriesCountPoints } from './date-buckets';
import { PartialDateRange, TimeScale } from './date-range.dto';

const at = (iso: string): Date => new Date(iso);

const cycled = (
  cycle: TimeScale,
  dates: Date[],
): { date: Date; value: number }[] =>
  generateSeriesCountPoints(
    dates,
    new PartialDateRange({
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-12-31T00:00:00Z'),
      cycle,
      timezone: 'UTC',
    }),
  );

const filled = (
  points: { date: Date; value: number }[],
): { at: string; value: number }[] =>
  points
    .filter((point) => point.value > 0)
    .map((point) => ({
      at: new Date(point.date.getTime()).toISOString(),
      value: point.value,
    }));

describe('cycling a series', () => {
  describe('a day cycle, which the profile activity chart asks for', () => {
    it('draws one bucket per hour of the day', () => {
      expect(cycled(TimeScale.Day, [])).toHaveLength(24);
    });

    it('gathers the same hour from different days into one bucket', () => {
      const points = cycled(TimeScale.Day, [
        at('2024-03-04T09:30:00Z'),
        at('2024-07-19T09:45:00Z'),
        at('2024-11-02T09:00:00Z'),
      ]);

      expect(filled(points)).toEqual([
        { at: '1970-01-01T09:00:00.000Z', value: 3 },
      ]);
    });

    it('keeps different hours of the day apart', () => {
      const points = cycled(TimeScale.Day, [
        at('2024-03-04T09:30:00Z'),
        at('2024-03-04T17:15:00Z'),
      ]);

      expect(filled(points)).toEqual([
        { at: '1970-01-01T09:00:00.000Z', value: 1 },
        { at: '1970-01-01T17:00:00.000Z', value: 1 },
      ]);
    });

    it('loses the calendar date entirely, which is the point of a cycle', () => {
      const oneDay = cycled(TimeScale.Day, [at('2024-03-04T09:30:00Z')]);
      const anotherDay = cycled(TimeScale.Day, [at('2019-08-22T09:30:00Z')]);

      expect(filled(oneDay)).toEqual(filled(anotherDay));
    });
  });

  describe('the other cycles', () => {
    it('gathers a year cycle into months', () => {
      const points = cycled(TimeScale.Year, [
        at('2024-03-04T09:30:00Z'),
        at('2019-03-22T11:00:00Z'),
      ]);

      expect(filled(points)).toEqual([
        { at: '1970-03-01T00:00:00.000Z', value: 2 },
      ]);
    });

    it('gathers an hour cycle into minutes', () => {
      const points = cycled(TimeScale.Hour, [
        at('2024-03-04T09:30:00Z'),
        at('2024-07-19T22:30:40Z'),
      ]);

      expect(filled(points)).toEqual([
        { at: '1970-01-01T00:30:00.000Z', value: 2 },
      ]);
    });

    it('leaves the dates alone when nothing is cycled', () => {
      const points = generateSeriesCountPoints(
        [at('2024-03-04T09:30:00Z')],
        new PartialDateRange({
          startDate: at('2024-03-01T00:00:00Z'),
          endDate: at('2024-03-08T00:00:00Z'),
          cycle: TimeScale.All,
          scale: TimeScale.Day,
          timezone: 'UTC',
        }),
      );

      expect(filled(points)).toEqual([
        { at: '2024-03-04T00:00:00.000Z', value: 1 },
      ]);
    });
  });

  describe('characterised, not specified', () => {
    it('holds a week cycle together within one year', () => {
      const monday = at('2024-01-01T12:00:00Z');
      const nextMonday = at('2024-01-08T12:00:00Z');

      expect(filled(cycled(TimeScale.Week, [monday, nextMonday]))).toEqual([
        { at: '1970-01-02T00:00:00.000Z', value: 2 },
      ]);
    });

    it('drifts a week cycle apart across years, since it folds by day of year', () => {
      const mondayIn2024 = at('2024-01-01T12:00:00Z');
      const mondayIn2023 = at('2023-01-02T12:00:00Z');

      expect(filled(cycled(TimeScale.Week, [mondayIn2024]))).not.toEqual(
        filled(cycled(TimeScale.Week, [mondayIn2023])),
      );
    });
  });
});
