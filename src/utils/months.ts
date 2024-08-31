import dayjs from "dayjs";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const getCurrentMonthRange = (): DateRange => {
  const now = dayjs();
  const firstDay = now.startOf("month").format("YYYY-MM-DD");
  const lastDay = now.endOf("month").format("YYYY-MM-DD");

  return {
    startDate: new Date(firstDay),
    endDate: new Date(lastDay),
  };
};
