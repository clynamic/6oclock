import { useTheme } from '@mui/material';
import { PieChart, PieValueType } from '@mui/x-charts';
import { useMemo } from 'react';

import { useTicketStatusSummary } from '../../api';
import { QueryHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const TicketStatusSummaryChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data, isLoading, error } = useTicketStatusSummary(
    range,
    refetchQueryOptions(),
  );

  const dataset: PieValueType[] = useMemo(() => {
    return [
      {
        id: 0,
        label: 'Open',
        value: data?.pending || 0,
        color: theme.palette.primary.main,
      },
      {
        id: 1,
        label: 'In Progress',
        value: data?.partial || 0,
        color: theme.palette.warning.main,
      },
      {
        id: 2,
        label: 'Closed',
        value: data?.approved || 0,
        color: theme.palette.secondary.main,
      },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [theme, data]);

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
