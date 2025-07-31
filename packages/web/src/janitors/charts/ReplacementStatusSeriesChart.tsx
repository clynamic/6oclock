import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useMemo } from 'react';

import {
  PostReplacementStatusPoint,
  usePostReplacementCreated,
  usePostReplacementStatus,
} from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { formatSeriesDateLabel } from '../../utils/ranges';
import { addToMergedSeries, isPointSeriesEmpty } from '../../utils/series';
import { SeriesChartProps, useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';

export const PostReplacementStatusSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartRange();

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = usePostReplacementStatus(range, refetchQueryOptions());

  const {
    data: createdData,
    isLoading: createdLoading,
    error: createdError,
  } = usePostReplacementCreated(range, refetchQueryOptions());

  const dataset = useMemo(() => {
    return addToMergedSeries<
      // it is inconvenient that we have to define this type manually.
      // however, we have not found a way to infere it correctly in [addToMergedSeries]
      keyof Omit<PostReplacementStatusPoint, 'date'>,
      'created'
    >(statusData || [], 'created', createdData || []);
  }, [statusData, createdData]);

  const chartProps: SeriesChartProps = {
    dataset: dataset,
    loading: statusLoading || createdLoading,
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
        stack: 'created',
      },
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
      noDataOverlay: {
        message: 'No data',
      },
    },
  };

  return (
    <QueryHint
      data={[statusData, createdData]}
      isLoading={[statusLoading, createdLoading]}
      isEmpty={isPointSeriesEmpty(dataset)}
      error={[statusError, createdError]}
      type="bars"
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};


