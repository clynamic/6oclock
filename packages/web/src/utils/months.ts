import dayjs from "dayjs";

export interface DateRange {
  start: Date;
  end: Date;
}

export const getCurrentMonthRange = (): DateRange => {
  const now = dayjs();
  const firstDay = now.startOf("month").format("YYYY-MM-DD");
  const lastDay = now.endOf("month").format("YYYY-MM-DD");

  return {
    start: new Date(firstDay),
    end: new Date(lastDay),
  };
};
