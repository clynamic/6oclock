import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useTicketCreatedSeriesForReporter } from "../../api";
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from "../../utils";

export interface TicketReporterChartProps {
  variant?: "bars" | "lines";
}

export const TicketReporterChart: React.FC<TicketReporterChartProps> = ({
  variant = "bars",
}) => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data } = useTicketCreatedSeriesForReporter(
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
        created: series?.find((e) => e.date === date)?.count ?? 0,
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
        dataKey: "created",
        label: "Created",
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
