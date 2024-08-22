import { PieChart, PieValueType } from "@mui/x-charts";
import { useMemo } from "react";

import { Ticket, TicketQtype } from "../../api";

export const TicketQtypeColors = {
  user: "#FFCCCB", // Soft pastel pink
  comment: "#FFDAB9", // Light peach
  forum: "#E6E6FA", // Lavender
  blip: "#B0E0E6", // Pale blue
  wiki: "#FFFACD", // Lemon chiffon
  pool: "#D3FFCE", // Light mint green
  set: "#FADADD", // Pale rose
  post: "#F0E68C", // Pastel yellow
  dmail: "#C1E1C1", // Light pastel green
} as const;

export interface TicketTypeChartProps {
  tickets?: Ticket[];
}

export const TicketTypeChart: React.FC<TicketTypeChartProps> = ({
  tickets,
}) => {
  const emptyQtypes = useMemo(() => {
    return Object.values(TicketQtype).filter(
      (qtype) => !tickets?.some((ticket) => ticket.qtype === qtype)
    );
  }, [tickets]);

  const data: PieValueType[] = useMemo(() => {
    return Object.values(TicketQtype)
      .filter((qtype) => !emptyQtypes.includes(qtype))
      .map((qtype, i) => ({
        id: i,
        label: qtype,
        value: tickets?.filter((ticket) => ticket.qtype === qtype).length || 0,
        color: TicketQtypeColors[qtype],
      }))
      .sort((a, b) => b.value - a.value);
  }, [emptyQtypes, tickets]);

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
