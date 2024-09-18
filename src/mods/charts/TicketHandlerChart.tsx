import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import { DateTime } from "luxon";
import { useMemo } from "react";

import { useTicketClosedSeriesForHandler } from "../../api";
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from "../../utils";

export interface TicketHandlerChartProps {
  variant?: "bars" | "lines";
}

export const TicketHandlerChart: React.FC<TicketHandlerChartProps> = ({
  variant = "bars",
}) => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data } = useTicketClosedSeriesForHandler(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    })
  );

  const chartProps: SeriesChartProps = {
    dataset: data?.map((e) => ({ ...e })) ?? [],
    xAxis: [
      {
        scaleType: "band",
        dataKey: "date",
        valueFormatter: (value) =>
          DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
      },
    ],
    series: [
      {
        dataKey: "count",
        label: "Closed",
        color: theme.palette.primary.main,
      },
    ],
    slotProps: {
      noDataOverlay: {
        message: "No data",
      },
    },
  };

  const Chart = useMemo(() => {
    return variant === "bars" ? BarChart : LineChart;
  }, [variant]);

  return <Chart {...chartProps} />;
};
