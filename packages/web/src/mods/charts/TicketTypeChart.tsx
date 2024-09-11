import { PieChart, PieValueType } from "@mui/x-charts";
import { useMemo } from "react";

import { TicketTypeSummary, useTicketTypeSummary } from "../../api";
import { DateRange, refetchQueryOptions } from "../../utils";

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
  range?: DateRange;
}

export const TicketTypeChart: React.FC<TicketTypeChartProps> = ({ range }) => {
  const { data: summary } = useTicketTypeSummary(range, refetchQueryOptions());

  const emptyQtypes = useMemo(() => {
    return Object.keys(summary || {})
      .map((qtype) => qtype as keyof TicketTypeSummary)
      .filter((type) => summary?.[type] === 0);
  }, [summary]);

  const data: PieValueType[] = useMemo(() => {
    return Object.keys(summary || {})
      .map((type) => type as keyof TicketTypeSummary)
      .filter((type) => !emptyQtypes.includes(type))
      .map((type, i) => ({
        id: i,
        label: type,
        value: summary?.[type] || 0,
        color: TicketQtypeColors[type],
      }))
      .sort((a, b) => b.value - a.value);
  }, [emptyQtypes, summary]);

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
      slotProps={{
        noDataOverlay: {
          message: "No data",
        },
      }}
    />
  );
};
