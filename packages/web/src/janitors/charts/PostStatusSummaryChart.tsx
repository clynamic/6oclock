import { useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { useMemo } from 'react';

import { usePostStatusSummary } from '../../api';
import { useChartDateRange } from '../../utils';

export const PostStatusSummaryChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data } = usePostStatusSummary(range);

  const dataset = useMemo(() => {
    return [
      {
        id: 0,
        label: 'Approved',
        value: data?.approved ?? 0,
        color: theme.palette.success.main,
      },
      {
        id: 1,
        label: 'Permitted',
        value: data?.permitted ?? 0,
        color: theme.palette.success.light,
      },
      {
        id: 2,
        label: 'Deleted',
        value: data?.deleted ?? 0,
        color: theme.palette.error.main,
      },
      {
        id: 3,
        label: 'Pending',
        value: data?.pending ?? 0,
        color: theme.palette.primary.main,
      },
    ].filter((item) => item.value > 0);
  }, [data, theme]);

  return (
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
  );
};
