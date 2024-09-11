import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useTicketClosedSeries, useTicketCreatedSeries } from "../../api";
import { DateRange, refetchQueryOptions, SeriesChartProps } from "../../utils";

export interface TicketActivityChartProps {
  range?: DateRange;
  variant?: "bars" | "lines";
}

export const TicketActivityChart: React.FC<TicketActivityChartProps> = ({
  range,
  variant = "bars",
}) => {
  const theme = useTheme();

  const { data: openData } = useTicketCreatedSeries(
    range,
    refetchQueryOptions()
  );
  const { data: closedData } = useTicketClosedSeries(
    range,
    refetchQueryOptions()
  );

  const openSeries = useMemo(
    () =>
      openData?.map((e) => ({
        ...e,
        date: dayjs(e.date).format("YYYY-MM-DD"),
      })),
    [openData]
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
        ...(openSeries?.map((e) => e.date) ?? []),
        ...(closedSeries?.map((e) => e.date) ?? []),
      ])
    ).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  }, [openSeries, closedSeries]);

  const dataset = useMemo(() => {
    return xAxisLabels.map((date) => {
      return {
        date,
        created: openSeries?.find((e) => e.date === date)?.count ?? 0,
        closed: closedSeries?.find((e) => e.date === date)?.count ?? 0,
      };
    });
  }, [openSeries, closedSeries, xAxisLabels]);

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
