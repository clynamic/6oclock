import { DateTime, DateTimeUnit } from 'luxon';
import { TimeScale } from '../api';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export const getCurrentMonthRange = (): DateRange => {
  const now = DateTime.now().toLocal();
  return {
    startDate: now.startOf('month').toJSDate(),
    endDate: now.endOf('month').toJSDate(),
    timezone: now.zoneName,
  };
};

export enum TimeDuration {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export const formatRangeLabel = (
  start: DateTime,
  end: DateTime,
  duration: TimeDuration,
): string => {
  if (duration === TimeDuration.Day) return start.toFormat('DDD');
  if (duration === TimeDuration.Week)
    return `${start.toFormat('DDD')} - ${end.minus({ days: 1 }).toFormat('DDD')}`;

  const endAdjusted = end.minus({ days: 1 });

  if (duration === TimeDuration.Month && start.hasSame(endAdjusted, 'month')) {
    return start.toFormat('LLLL yyyy');
  }

  if (duration === TimeDuration.Year && start.hasSame(endAdjusted, 'year')) {
    return start.toFormat('yyyy');
  }

  const sameYear = start.year === endAdjusted.year;
  if (sameYear)
    return `${start.toFormat('LLL')} - ${endAdjusted.toFormat('LLL yyyy')}`;
  return `${start.toFormat('LLL yyyy')} - ${endAdjusted.toFormat('LLL yyyy')}`;
};

export const inferDurationFromRange = (
  start: DateTime,
  end: DateTime,
): TimeDuration => {
  const diff = end.diff(start, ['days']).days;
  if (diff <= 1) return TimeDuration.Day;
  if (diff <= 8) return TimeDuration.Week;
  if (diff <= 32) return TimeDuration.Month;
  return TimeDuration.Year;
};

export const unitFromDuration = (duration: TimeDuration): DateTimeUnit => {
  switch (duration) {
    case TimeDuration.Day:
      return 'day';
    case TimeDuration.Week:
      return 'week';
    case TimeDuration.Month:
      return 'month';
    case TimeDuration.Year:
      return 'year';
  }
};

export const inferScaleFromRange = (
  start: DateTime,
  end: DateTime,
): TimeScale => {
  const diffInMs = Math.abs(end.toMillis() - start.toMillis());
  const hours = diffInMs / (1000 * 60 * 60);
  const days = hours / 24;
  const months = days / 30;
  const years = days / 365;

  if (hours <= 2) return TimeScale.minute;
  if (days <= 2) return TimeScale.hour;
  if (months <= 1.1) return TimeScale.day;
  if (months <= 2) return TimeScale.week;
  if (years <= 2) return TimeScale.month;
  if (years <= 10) return TimeScale.year;
  return TimeScale.decade;
};

export const formatSeriesDateLabel = (
  date: Date,
  series: { date: Date }[],
): string => {
  const start = DateTime.fromJSDate(series[0].date);
  const end = DateTime.fromJSDate(series[series.length - 1].date);
  const scale = inferScaleFromRange(start, end);
  const _date = DateTime.fromJSDate(date);
  switch (scale) {
    case TimeScale.minute:
      if (end.diff(start, 'minutes').minutes <= 1) {
        return _date.toFormat('ss');
      }
      if (end.diff(start, 'minutes').minutes < 60) {
        return _date.toFormat('mm');
      }
      return _date.toFormat('HH:mm');
    case TimeScale.hour:
      return _date.toFormat('HH:mm');
    case TimeScale.day:
      if (end.diff(start, 'days').days < 8) {
        return _date.toFormat('cccc');
      }
      return _date.toFormat('dd LLLL');
    case TimeScale.week:
      return _date.toFormat('dd LLLL');
    case TimeScale.month:
      return _date.toFormat('LLLL yyyy');
    case TimeScale.year:
      return _date.toFormat('yyyy');
    case TimeScale.decade:
      return `${_date.year} - ${_date.year + 9}`;
    default:
      throw new Error(`Unsupported time scale: ${scale}`);
  }
};
