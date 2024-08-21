import dayjs from "dayjs";

export const getCurrentMonthRange = (): string => {
  const now = dayjs();
  const firstDay = now.startOf("month").format("YYYY-MM-DD");
  const lastDay = now.endOf("month").format("YYYY-MM-DD");

  return `${firstDay}..${lastDay}`;
};
