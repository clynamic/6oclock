import { BarChart, LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { Ticket } from "../../api";
import { useMemo } from "react";
import { useTheme } from "@mui/material";
import { SeriesChartProps } from "../../utils";

export interface TicketActivityChartProps {
  tickets?: Ticket[];
  variant?: "bars" | "lines";
}

export const TicketActivityChart: React.FC<TicketActivityChartProps> = ({
  tickets,
  variant = "bars",
}) => {
  const theme = useTheme();

  const xAxisLabels = useMemo(() => {
    const creationDates = tickets?.map((ticket) =>
      dayjs(ticket.created_at).format("YYYY-MM-DD")
    );

    const closureDates = tickets
      ?.filter((ticket) => ticket.status === "approved")
      .map((ticket) => dayjs(ticket.updated_at).format("YYYY-MM-DD"));

    return Array.from(
      new Set([...(creationDates ?? []), ...(closureDates ?? [])])
    ).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  }, [tickets]);

  const dataset = useMemo(() => {
    return xAxisLabels.map((date) => {
      const createdCount =
        tickets?.filter(
          (ticket) => dayjs(ticket.created_at).format("YYYY-MM-DD") === date
        ).length ?? 0;

      const closedCount =
        tickets?.filter(
          (ticket) =>
            ticket.status === "approved" &&
            dayjs(ticket.updated_at).format("YYYY-MM-DD") === date
        ).length ?? 0;

      return {
        date,
        created: createdCount,
        closed: closedCount,
      };
    });
  }, [tickets, xAxisLabels]);

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
  };

  return variant === "bars" ? (
    <BarChart {...chartProps} />
  ) : (
    <LineChart {...chartProps} />
  );
};
