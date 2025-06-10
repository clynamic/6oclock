import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { useMemo } from 'react';

import { useTicketClosedSeries, useTicketCreatedSeries } from '../../api';
import { QueryHint } from '../../common';
import {
  formatSeriesDateLabel,
  isPointSeriesEmpty,
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartRange,
} from '../../utils';

export interface TicketTurnaroundChartProps {
  variant?: 'bars' | 'lines';
}

export const TicketStatusSeriesChart: React.FC<TicketTurnaroundChartProps> = ({
  variant = 'bars',
}) => {
  const theme = useTheme();
  const range = useChartRange();

  const {
    data: createdData,
    isLoading: createdLoading,
    error: createdError,
  } = useTicketCreatedSeries(range, refetchQueryOptions());

  const {
    data: closedData,
    isLoading: closedLoading,
    error: closedError,
  } = useTicketClosedSeries(range, refetchQueryOptions());

  const dataset = useMemo(() => {
    return mergePointSeries({
      created: createdData || [],
      closed: closedData || [],
    });
  }, [createdData, closedData]);

  const chartProps: SeriesChartProps = {
    dataset,
    loading: createdLoading || closedLoading,
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) => formatSeriesDateLabel(value, dataset),
      },
    ],
    series: [
      {
        dataKey: 'created',
        label: 'Created',
        color: theme.palette.primary.main,
      },
      {
        dataKey: 'closed',
        label: 'Closed',
        color: theme.palette.secondary.main,
      },
    ],
    slotProps: {
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
      data={[createdData, closedData]}
      isLoading={[createdLoading, closedLoading]}
      isEmpty={isPointSeriesEmpty(dataset)}
      error={[createdError, closedError]}
      type={variant}
    >
      <Chart {...chartProps} />
    </QueryHint>
  );
};
