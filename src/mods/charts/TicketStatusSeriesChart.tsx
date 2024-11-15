import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { useTicketClosedSeries, useTicketCreatedSeries } from '../../api';
import { QueryHint } from '../../common';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartDateRange,
} from '../../utils';

export interface TicketTurnaroundChartProps {
  variant?: 'bars' | 'lines';
}

export const TicketStatusSeriesChart: React.FC<TicketTurnaroundChartProps> = ({
  variant = 'bars',
}) => {
  const theme = useTheme();
  const range = useChartDateRange();

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
        valueFormatter: (value) =>
          DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
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
      isLoading={[createdLoading, closedLoading]}
      error={[createdError, closedError]}
      type={variant}
    >
      <Chart {...chartProps} />
    </QueryHint>
  );
};
