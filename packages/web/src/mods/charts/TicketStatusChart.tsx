import { PieChart, PieValueType } from "@mui/x-charts";
import { Ticket } from "../../api";
import { useMemo } from "react";
import { useTheme } from "@mui/material";

export interface TicketStatusChartProps {
  tickets?: Ticket[];
}

export const TicketStatusChart: React.FC<TicketStatusChartProps> = ({
  tickets,
}) => {
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
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
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
          arcLabelMinAngle: 20,
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
