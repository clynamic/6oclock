import { useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useTicketOpenSeries } from "../../api";
import { refetchQueryOptions, useChartDateRange } from "../../utils";

export const TicketFrontlineChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: series } = useTicketOpenSeries(range, refetchQueryOptions());

  const data = useMemo(
    () =>
      series?.map((e) => ({
        date: dayjs(e.date).format("YYYY-MM-DD"),
        count: e.count,
      })) ?? [],
    [series]
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
      slotProps={{
        noDataOverlay: {
          message: "No data",
        },
      }}
    />
  );
};
