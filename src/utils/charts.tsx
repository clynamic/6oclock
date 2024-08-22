import { BarChart, LineChart } from "@mui/x-charts";

export type SeriesChartProps = Parameters<typeof BarChart>[0] &
  Parameters<typeof LineChart>[0];
