import { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';

import { usePostReplacementHandled } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { SeriesChartProps, useChartValue } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { formatSeriesDateLabel } from '../../utils/ranges';

export interface ReplacementHandledChartProps {
  variant?: 'bars' | 'lines';
}

export const ReplacementHandledSeriesChart: React.FC<
  ReplacementHandledChartProps
> = ({ variant = 'bars' }) => {
  const theme = useTheme();
  const { range, userId } = useChartValue();

  const { data, isLoading, error } = usePostReplacementHandled(
    {
      userId: userId ?? 0,
      ...range,
    },
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const chartProps: SeriesChartProps = {
    dataset: data?.map((e) => ({ ...e })) ?? [],
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) => formatSeriesDateLabel(value, data!),
      },
    ],
    series: [
      {
        dataKey: 'approved',
        label: 'Approved',
        color: theme.palette.success.main,
        stack: 'handled',
      },
      {
        dataKey: 'promoted',
        label: 'Promoted',
        color: theme.palette.success.light,
        stack: 'handled',
      },
      {
        dataKey: 'rejected',
        label: 'Rejected',
        color: theme.palette.error.main,
        stack: 'handled',
      },
    ],
    slotProps: {
      legend: {
        hidden: true,
      },
      noDataOverlay: {
        message: 'No data',
      },
    },
  };

  const Chart = useMemo(() => {
    return variant === 'bars' ? BarChart : LineChart;
  }, [variant]);

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      isEmpty={data?.every(
        (e) => e.approved === 0 && e.promoted === 0 && e.rejected === 0,
      )}
      error={error}
      type={variant}
    >
      <Chart {...chartProps} />
    </QueryHint>
  );
};
