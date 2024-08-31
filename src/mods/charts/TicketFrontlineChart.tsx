import { useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useTicketOpenSeries } from "../../api";
import { DateRange } from "../../utils";

export interface TicketFrontlineChartProps {
  range?: DateRange;
}

export const TicketFrontlineChart: React.FC<TicketFrontlineChartProps> = ({
  range,
}) => {
  const theme = useTheme();

  const { data: series } = useTicketOpenSeries(range);

  const data = useMemo(
    () =>
      series?.map((e) => ({
        date: dayjs(e.date).format("YYYY-MM-DD"),
        count: e.count,
      })) ?? [],
    [series],
  );

  return (
    <LineChart
      dataset={data}
      xAxis={[
        {
          scaleType: "band",
          dataKey: "date",
        },
      ]}
      series={[
        {
          dataKey: "count",
          label: "Open Tickets",
          color: theme.palette.primary.main,
        },
      ]}
    />
  );
};
