import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useTicketClosedSeries, useTicketCreatedSeries } from "../../api";
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartDateRange,
} from "../../utils";

export interface TicketActivityChartProps {
  variant?: "bars" | "lines";
}

export const TicketActivityChart: React.FC<TicketActivityChartProps> = ({
  variant = "bars",
}) => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: createdData } = useTicketCreatedSeries(
    range,
    refetchQueryOptions()
  );
  const { data: closedData } = useTicketClosedSeries(
    range,
    refetchQueryOptions()
  );

  const createdSeries = useMemo(
    () =>
      createdData?.map((e) => ({
        ...e,
        date: dayjs(e.date).format("YYYY-MM-DD"),
      })),
    [createdData]
  );

  const closedSeries = useMemo(
    () =>
      closedData?.map((e) => ({
        ...e,
        date: dayjs(e.date).format("YYYY-MM-DD"),
      })),
    [closedData]
  );

  const xAxisLabels = useMemo(() => {
    return Array.from(
      new Set([
        ...(createdSeries?.map((e) => e.date) ?? []),
        ...(closedSeries?.map((e) => e.date) ?? []),
      ])
    ).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  }, [createdSeries, closedSeries]);

  const dataset = useMemo(() => {
    return xAxisLabels.map((date) => {
      return {
        date,
        created: createdSeries?.find((e) => e.date === date)?.count ?? 0,
        closed: closedSeries?.find((e) => e.date === date)?.count ?? 0,
      };
    });
  }, [createdSeries, closedSeries, xAxisLabels]);

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
      {
        dataKey: "closed",
        label: "Closed",
        color: theme.palette.secondary.main,
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
