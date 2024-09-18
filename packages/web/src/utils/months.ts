import { DateTime } from "luxon";

export interface DateRange {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export const getCurrentMonthRange = (): DateRange => {
  const now = DateTime.now().toLocal();
  return {
    startDate: now.startOf("month").toJSDate(),
    endDate: now.endOf("month").toJSDate(),
    timezone: now.zoneName,
  };
};
