import { DateTime, DateTimeUnit } from 'luxon';

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
