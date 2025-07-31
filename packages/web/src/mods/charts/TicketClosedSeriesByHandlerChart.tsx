import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { useMemo } from 'react';

import { useTicketClosedSeriesByHandler } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { formatSeriesDateLabel } from '../../utils/ranges';
import { SeriesChartProps, useChartValue } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';

export interface TicketHandlerChartProps {
  variant?: 'bars' | 'lines';
}

export const TicketClosedSeriesByHandlerChart: React.FC<
  TicketHandlerChartProps
> = ({ variant = 'bars' }) => {
  const theme = useTheme();
  const { range, userId } = useChartValue();

  const { data, isLoading, error } = useTicketClosedSeriesByHandler(
    userId ?? 0,
    range,
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
        dataKey: 'value',
        label: 'Closed',
        color: theme.palette.primary.main,
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
      isEmpty={data?.map((e) => e.value).reduce((a, b) => a + b, 0) === 0}
      isLoading={isLoading}
      error={error}
      type={variant}
    >
      <Chart {...chartProps} />
    </QueryHint>
  );
};


