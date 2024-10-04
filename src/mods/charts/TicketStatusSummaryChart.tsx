import { useTheme } from '@mui/material';
import { PieChart, PieValueType } from '@mui/x-charts';
import { useMemo } from 'react';

import { useTicketStatusSummary } from '../../api';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const TicketStatusSummaryChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: summary } = useTicketStatusSummary(
    range,
    refetchQueryOptions(),
  );

  const data: PieValueType[] = useMemo(() => {
    return [
      {
        id: 0,
        label: 'Open',
        value: summary?.pending || 0,
        color: theme.palette.primary.main,
      },
      {
        id: 1,
        label: 'In Progress',
        value: summary?.partial || 0,
        color: theme.palette.warning.main,
      },
      {
        id: 2,
        label: 'Closed',
        value: summary?.approved || 0,
        color: theme.palette.secondary.main,
      },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [theme, summary]);

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
