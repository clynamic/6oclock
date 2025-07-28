import {
  differenceInDays,
  differenceInMilliseconds,
  differenceInMinutes,
  endOfMonth,
  format,
  getYear,
  isSameMonth,
  isSameYear,
  startOfMonth,
  subDays,
} from 'date-fns';
import { tz } from '@date-fns/tz';

import { TimeScale } from '../api';
import { SHIP_TIMEZONE } from './timezone';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const timezone = SHIP_TIMEZONE;
  return {
    startDate: startOfMonth(now, { in: tz(timezone) }),
    endDate: endOfMonth(now, { in: tz(timezone) }),
    timezone,
  };
};

export enum TimeDuration {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export const formatRangeLabel = (
  start: Date,
  end: Date,
  duration: TimeDuration,
): string => {
  if (duration === TimeDuration.Day) return format(start, 'PPP');
  if (duration === TimeDuration.Week)
    return `${format(start, 'PPP')} - ${format(subDays(end, 1), 'PPP')}`;

  const endAdjusted = subDays(end, 1);

  if (duration === TimeDuration.Month && isSameMonth(start, endAdjusted)) {
    return format(start, 'MMMM yyyy');
  }

  if (duration === TimeDuration.Year && isSameYear(start, endAdjusted)) {
    return format(start, 'yyyy');
  }

  const sameYear = getYear(start) === getYear(endAdjusted);
  if (sameYear)
    return `${format(start, 'LLL')} - ${format(endAdjusted, 'LLL yyyy')}`;
  return `${format(start, 'LLL yyyy')} - ${format(endAdjusted, 'LLL yyyy')}`;
};

export const inferDurationFromRange = (
  start: Date,
  end: Date,
): TimeDuration => {
  const diff = differenceInDays(end, start);
  if (diff <= 1) return TimeDuration.Day;
  if (diff <= 8) return TimeDuration.Week;
  if (diff <= 32) return TimeDuration.Month;
  return TimeDuration.Year;
};

export const unitFromDuration = (duration: TimeDuration): string => {
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

export const inferScaleFromRange = (start: Date, end: Date): TimeScale => {
  const diffInMs = Math.abs(differenceInMilliseconds(end, start));
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
  const start = series[0].date;
  const end = series[series.length - 1].date;
  const scale = inferScaleFromRange(start, end);

  switch (scale) {
    case TimeScale.minute:
      const diffMinutes = differenceInMinutes(end, start);
      if (differenceInDays(end, start) === 0 && diffMinutes <= 1) {
        return format(date, 'ss');
      }
      if (differenceInDays(end, start) === 0 && diffMinutes < 60) {
        return format(date, 'mm');
      }
      return format(date, 'HH:mm');
    case TimeScale.hour:
      return format(date, 'HH:mm');
    case TimeScale.day:
      if (differenceInDays(end, start) < 8) {
        return format(date, 'cccc');
      }
      return format(date, 'dd MMMM');
    case TimeScale.week:
      return format(date, 'dd MMMM');
    case TimeScale.month:
      return format(date, 'MMMM yyyy');
    case TimeScale.year:
      return format(date, 'yyyy');
    case TimeScale.decade:
      return `${getYear(date)} - ${getYear(date) + 9}`;
    default:
      throw new Error(`Unsupported time scale: ${scale}`);
  }
};
