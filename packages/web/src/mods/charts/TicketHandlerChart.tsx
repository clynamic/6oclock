import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useTicketClosedSeriesForTicketer } from "../../api";
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

  const { data } = useTicketClosedSeriesForTicketer(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    })
  );

  const series = useMemo(
    () =>
      data?.map((e) => ({
        ...e,
        date: dayjs(e.date).format("YYYY-MM-DD"),
      })),
    [data]
  );

  const xAxisLabels = useMemo(() => {
    return Array.from(new Set(series?.map((e) => e.date) ?? [])).sort(
      (a, b) => dayjs(a).unix() - dayjs(b).unix()
    );
  }, [series]);

  const dataset = useMemo(() => {
    return xAxisLabels.map((date) => {
      return {
        date,
        closed: series?.find((e) => e.date === date)?.count ?? 0,
      };
    });
  }, [series, xAxisLabels]);

  const chartProps: SeriesChartProps = {
    dataset,
    xAxis: [
      {
        scaleType: "band",
        dataKey: "date",
      },
    ],
    series: [
      {
        dataKey: "closed",
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
