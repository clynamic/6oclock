import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInMilliseconds,
  differenceInMinutes,
  endOfMonth,
  format,
  getYear,
  isAfter,
  isBefore,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import { TZDate } from '@date-fns/tz';

import { TimeScale } from '../api';
import { SHIP_TIMEZONE } from './timezone';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export const getCurrentMonthRange = (): DateRange => {
  const now = new TZDate(new Date(), SHIP_TIMEZONE);
  const timezone = SHIP_TIMEZONE;
  return {
    startDate: startOfMonth(now),
    endDate: endOfMonth(now),
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

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export const unitFromDuration = (duration: TimeDuration): TimeUnit => {
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

export const startOfPeriod = (date: Date, unit: TimeUnit): Date => {
  switch (unit) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfWeek(date);
    case 'month':
      return startOfMonth(date);
    case 'year':
      return startOfYear(date);
    default:
      return date;
  }
};

export const addPeriods = (
  date: Date,
  unit: TimeUnit,
  amount: number,
): Date => {
  switch (unit) {
    case 'day':
      return addDays(date, amount);
    case 'week':
      return addWeeks(date, amount);
    case 'month':
      return addMonths(date, amount);
    case 'year':
      return addYears(date, amount);
    default:
      return date;
  }
};

export const isInPeriod = (
  date: Date,
  reference: Date,
  unit: TimeUnit,
): boolean => {
  const start = startOfPeriod(reference, unit);
  const end = addPeriods(start, unit, 1);
  console.log(
    `Checking if ${date} is in period from ${start} to ${end}: ${!isBefore(date, start) && isBefore(date, end)}`,
  );
  return !isBefore(date, start) && !isAfter(date, end);
};

export const subPeriods = (
  date: Date,
  unit: TimeUnit,
  amount: number,
): Date => {
  switch (unit) {
    case 'day':
      return subDays(date, amount);
    case 'week':
      return addWeeks(date, -amount);
    case 'month':
      return addMonths(date, -amount);
    case 'year':
      return addYears(date, -amount);
    default:
      return date;
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
