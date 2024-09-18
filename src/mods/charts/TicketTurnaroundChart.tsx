import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import { DateTime } from "luxon";
import { useMemo } from "react";

import { useTicketClosedSeries, useTicketCreatedSeries } from "../../api";
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartDateRange,
} from "../../utils";

export interface TicketTurnaroundChartProps {
  variant?: "bars" | "lines";
}

export const TicketTurnaroundChart: React.FC<TicketTurnaroundChartProps> = ({
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

  const dataset = useMemo(() => {
    const dateMap: Record<
      string,
      { date: Date; created: number; closed: number }
    > = {};

    const dateString = (date: Date) => DateTime.fromJSDate(date).toISODate();

    if (createdData) {
      for (const point of createdData) {
        const date = dateString(point.date)!;
        if (!dateMap[date]) {
          dateMap[date] = { date: point.date, created: 0, closed: 0 };
        }
        dateMap[date].created = point.count;
      }
    }

    if (closedData) {
      for (const point of closedData) {
        const date = dateString(point.date)!;
        if (!dateMap[date]) {
          dateMap[date] = { date: point.date, created: 0, closed: 0 };
        }
        dateMap[date].closed = point.count;
      }
    }

    return Object.values(dateMap);
  }, [createdData, closedData]);

  const chartProps: SeriesChartProps = {
    dataset,
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
