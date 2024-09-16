import { useTheme } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useApprovalCountSeries } from "../../api";
import { DateRange, SeriesChartProps, useChartDateRange } from "../../utils";

export interface ApprovalTurnaroundChartProps {
  range?: DateRange;
  variant?: "bars" | "lines";
}

export const ApprovalTurnaroundChart: React.FC<
  ApprovalTurnaroundChartProps
> = ({ variant = "bars" }) => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: approvedData } = useApprovalCountSeries(range);

  const approvedSeries = useMemo(
    () =>
      approvedData?.map((e) => ({
        ...e,
        date: dayjs(e.date).format("YYYY-MM-DD"),
      })),
    [approvedData]
  );

  const xAxisLabels = useMemo(() => {
    return Array.from(
      new Set([
        // ...(uploadedSeries?.map((e) => e.date) ?? []),
        ...(approvedSeries?.map((e) => e.date) ?? []),
      ])
    ).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  }, [approvedSeries]);

  const dataset = useMemo(() => {
    return xAxisLabels.map((date) => {
      return {
        date,
        // uploaded: uploadedSeries?.find((e) => e.date === date)?.count ?? 0,
        approved: approvedSeries?.find((e) => e.date === date)?.count ?? 0,
      };
    });
  }, [approvedSeries, xAxisLabels]);

  const chartProps: SeriesChartProps = {
    dataset,
    xAxis: [
      {
        scaleType: "band",
        dataKey: "date",
      },
    ],
    series: [
      /*
      {
        dataKey: "uploaded",
        label: "Uploaded",
        color: theme.palette.primary.main,
      },
      */
      {
        dataKey: "approved",
        label: "Approved",
        color: theme.palette.success.main,
      },
    ],
    slotProps: {
      noDataOverlay: {
        message: "No data",
      },
    },
  };

  return variant === "bars" ? (
    <BarChart {...chartProps} />
  ) : (
    <LineChart {...chartProps} />
  );
};
