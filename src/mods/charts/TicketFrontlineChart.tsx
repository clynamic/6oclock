import { LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { Ticket } from "../../api";
import { useMemo } from "react";
import { useTheme } from "@mui/material";

export interface TicketFrontlineChartProps {
  tickets?: Ticket[];
}

export const TicketFrontlineChart: React.FC<TicketFrontlineChartProps> = ({
  tickets,
}) => {
  const theme = useTheme();

  const openTicketCountsByDay = useMemo(() => {
    const openTicketCounts: Record<string, number> = {};

    tickets?.forEach((ticket) => {
      const createdDate = dayjs(ticket.created_at);
      const updatedDate =
        ticket.status === "approved" ? dayjs(ticket.updated_at) : null;

      const endDate = updatedDate || dayjs();

      for (
        let date = createdDate;
        date.isBefore(endDate) || date.isSame(endDate);
        date = date.add(1, "day")
      ) {
        const formattedDate = date.format("YYYY-MM-DD");
        openTicketCounts[formattedDate] =
          (openTicketCounts[formattedDate] || 0) + 1;
      }
    });

    return Object.keys(openTicketCounts)
      .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
      .map((date) => ({
        date,
        openCount: openTicketCounts[date],
      }));
  }, [tickets]);

  return (
    <LineChart
      dataset={openTicketCountsByDay}
      xAxis={[
        {
          scaleType: "band",
          dataKey: "date",
        },
      ]}
      series={[
        {
          dataKey: "openCount",
          label: "Open Tickets",
          color: theme.palette.primary.main,
        },
      ]}
    />
  );
};
