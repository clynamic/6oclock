import dayjs from "dayjs";
import { useMemo } from "react";
import { Approval, Upload } from "../../api";
import { BarChart, LineChart } from "@mui/x-charts";
import { SeriesChartProps } from "../../utils";
import { useTheme } from "@mui/material";

export interface ApprovalActivityProps {
  approvals?: Approval[];
  uploads?: Upload[];
  variant?: "bars" | "lines";
}

export const ApprovalActivityChart: React.FC<ApprovalActivityProps> = ({
  approvals,
  uploads,
  variant = "bars",
}) => {
  const theme = useTheme();

  const xAxisLabelsAndCounts = useMemo(() => {
    const createdCounts = new Map<string, number>();
    const closedCounts = new Map<string, number>();

    uploads?.forEach((upload) => {
      const formattedDate = dayjs(upload.created_at).format("YYYY-MM-DD");
      createdCounts.set(
        formattedDate,
        (createdCounts.get(formattedDate) || 0) + 1
      );
    });

    approvals?.forEach((approval) => {
      const formattedDate = dayjs(approval.created_at).format("YYYY-MM-DD");
      closedCounts.set(
        formattedDate,
        (closedCounts.get(formattedDate) || 0) + 1
      );
    });

    const allDates = new Set([...createdCounts.keys(), ...closedCounts.keys()]);

    return Array.from(allDates)
      .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
      .map((date) => ({
        date,
        created: createdCounts.get(date) || 0,
        closed: closedCounts.get(date) || 0,
      }));
  }, [uploads, approvals]);

  const dataset = useMemo(() => xAxisLabelsAndCounts, [xAxisLabelsAndCounts]);

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
        label: "Uploaded",
        color: theme.palette.primary.main,
      },
      {
        dataKey: "closed",
        label: "Approved",
        color: theme.palette.success.main,
      },
    ],
  };

  return variant === "bars" ? (
    <BarChart {...chartProps} />
  ) : (
    <LineChart {...chartProps} />
  );
};