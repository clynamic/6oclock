import { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { PieChart, PieValueType } from '@mui/x-charts';

import { TimeScale, useFlagStatus } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';

export const FlagStatusSummaryChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartRange();

  const { data, isLoading, error } = useFlagStatus(
    { ...range, scale: TimeScale.all },
    {
      query: {
        ...refetchQueryOptions(),
        select: (data) => data?.[0],
      },
    },
  );

  const dataset: PieValueType[] = useMemo(() => {
    return [
      {
        id: 0,
        label: 'Open',
        value: data?.open || 0,
        color: theme.palette.primary.main,
      },
      {
        id: 1,
        label: 'Cleared',
        value: data?.removed || 0,
        color: theme.palette.secondary.main,
      },
      {
        id: 2,
        label: 'Deleted',
        value: data?.deleted || 0,
        color: theme.palette.error.main,
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
        localeText={{ noData: 'No data' }}
      />
    </QueryHint>
  );
};
