import { PieChart, PieValueType } from "@mui/x-charts";
import { Ticket } from "../api";
import { useMemo } from "react";
import { Box, Card, Stack, Typography, useTheme } from "@mui/material";
import { DashboardCard } from "../common";

export interface TicketPieChartProps {
  tickets?: Ticket[];
}

export const TicketPieChart: React.FC<TicketPieChartProps> = ({ tickets }) => {
  const theme = useTheme();

  const data: PieValueType[] = useMemo(() => {
    return [
      {
        id: 0,
        label: "Open",
        value:
          tickets?.filter((ticket) => ticket.status === "pending").length || 0,
        color: theme.palette.primary.main,
      },
      {
        id: 1,
        label: "In Progress",
        value:
          tickets?.filter((ticket) => ticket.status === "partial").length || 0,
        color: theme.palette.warning.main,
      },
      {
        id: 2,
        label: "Closed",
        value:
          tickets?.filter((ticket) => ticket.status === "approved").length || 0,
        color: theme.palette.secondary.main,
      },
    ];
  }, [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    tickets,
  ]);

  return (
    <PieChart
      sx={{ height: "100%" }}
      series={[
        {
          data: data,
          arcLabel: (item) => `${item.value}`,
          arcLabelMinAngle: 10,
          innerRadius: "30%",
          outerRadius: "90%",
          paddingAngle: 5,
          cornerRadius: 5,
          cx: "50%",
          cy: "50%",
        },
      ]}
    />
  );
};
