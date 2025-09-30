import { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts';

import { usePostStatusSummary } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';

export const PostStatusSummaryChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartRange();

  const { data, isLoading, error } = usePostStatusSummary(
    range,
    refetchQueryOptions(),
  );

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
        loading={isLoading}
        slotProps={{
          noDataOverlay: {
            message: 'No data',
          },
        }}
      />
    </QueryHint>
  );
};
