import { useMemo } from 'react';

import { PieChart, PieValueType } from '@mui/x-charts';

import { TicketTypeSummary, useTicketTypeSummary } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';

export const TicketTypeColors = {
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
  const range = useChartRange();
  const { data, isLoading, error } = useTicketTypeSummary(
    range,
    refetchQueryOptions(),
  );

  const emptyTypes = useMemo(() => {
    return Object.keys(data || {})
      .map((qtype) => qtype as keyof TicketTypeSummary)
      .filter((type) => data?.[type] === 0);
  }, [data]);

  const dataset: PieValueType[] = useMemo(() => {
    return Object.keys(data || {})
      .map((type) => type as keyof TicketTypeSummary)
      .filter((type) => !emptyTypes.includes(type))
      .map((type, i) => ({
        id: i,
        label: type,
        value: data?.[type] || 0,
        color: TicketTypeColors[type],
      }))
      .sort((a, b) => b.value - a.value);
  }, [emptyTypes, data]);

  return (
    <QueryHint data={dataset} isLoading={isLoading} error={error} type="pie">
      <PieChart
        sx={{ height: '100%' }}
        series={[
          {
            data: dataset,
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
        margin={{
          right: 150,
        }}
      />
    </QueryHint>
  );
};
