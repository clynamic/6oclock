import { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';

import { useTicketCreatedSeriesByReporter } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { SeriesChartProps, useChartValue } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { formatSeriesDateLabel } from '../../utils/ranges';

export interface TicketReporterChartProps {
  variant?: 'bars' | 'lines';
}

export const TicketCreatedSeriesByReporterChart: React.FC<
  TicketReporterChartProps
> = ({ variant = 'bars' }) => {
  const theme = useTheme();
  const { range, userId } = useChartValue();

  const { data, isLoading, error } = useTicketCreatedSeriesByReporter(
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
        label: 'Created',
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
      data={data}
      isLoading={isLoading}
      isEmpty={data?.every((e) => e.value === 0)}
      error={error}
      type={variant}
    >
      <Chart {...chartProps} />
    </QueryHint>
  );
};
