import { PieChart, PieValueType } from '@mui/x-charts';
import { useMemo } from 'react';

import { TicketAgeSummary, useTicketAgeSummary } from '../../api';
import { QueryHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const TicketAgeColors = {
  oneDay: '#82b74b', // Moss green
  threeDays: '#ffcc5c', // Soft gold
  oneWeek: '#ffa07a', // Light coral
  twoWeeks: '#4682b4', // Steel blue
  oneMonth: '#6a5acd', // Royal purple
  aboveOneMonth: '#bf5b17', // Burnt orange
} as const;

export const TicketAgeLabels = {
  oneDay: '1 day',
  threeDays: '3 days',
  oneWeek: '1 week',
  twoWeeks: '2 weeks',
  oneMonth: '1 month',
  aboveOneMonth: '> 1 month',
} as const;

export const TicketAgeSummaryChart: React.FC = () => {
  const range = useChartDateRange();
  const { data, isLoading, error } = useTicketAgeSummary(
    range,
    refetchQueryOptions(),
  );

  const dataset: PieValueType[] = useMemo(() => {
    return Object.keys(data || {})
      .map((group) => group as keyof TicketAgeSummary)
      .filter((group) => data?.[group] !== 0)
      .map((group, i) => ({
        id: i,
        label: TicketAgeLabels[group],
        value: data?.[group] || 0,
        color: TicketAgeColors[group],
      }))
      .sort(
        (a, b) =>
          Object.keys(TicketAgeLabels).indexOf(a.label) -
          Object.keys(TicketAgeLabels).indexOf(b.label),
      );
  }, [data]);

  return (
    <QueryHint isLoading={isLoading} error={error} type="pie">
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
