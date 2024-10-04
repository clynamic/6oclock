import { PieChart, PieValueType } from '@mui/x-charts';
import { useMemo } from 'react';

import { TicketTypeSummary, useTicketTypeSummary } from '../../api';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const TicketQtypeColors = {
  user: '#e1675d', // Vibrant coral
  comment: '#f2b07e', // Rich peach
  forum: '#d1b3f1', // Deep lavender
  blip: '#77c1e4', // Sky blue
  wiki: '#ffe36d', // Bold lemon
  pool: '#92e4aa', // Mint green
  set: '#f092b0', // Rose pink
  post: '#f0c23b', // Golden yellow
  dmail: '#88cc88', // Fresh green
} as const;

export const TicketTypeSummaryChart: React.FC = () => {
  const range = useChartDateRange();
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
      sx={{ height: '100%' }}
      series={[
        {
          data: data,
          arcLabel: (item) => `${item.value}`,
          arcLabelMinAngle: 20,
          innerRadius: '30%',
          outerRadius: '90%',
          paddingAngle: 5,
          cornerRadius: 5,
          cx: '50%',
          cy: '50%',
        },
      ]}
      slotProps={{
        noDataOverlay: {
          message: 'No data',
        },
      }}
    />
  );
};
