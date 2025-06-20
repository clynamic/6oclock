import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useMemo } from 'react';

import {
  useApprovalCountSeriesByApprover,
  useDeletionSeriesByDeleter,
} from '../../api';
import { QueryHint } from '../../common';
import {
  formatSeriesDateLabel,
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartValue,
} from '../../utils';

export const ApprovalCountSeriesByApproverChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartValue();

  const {
    data: approvedData,
    isLoading: approvedLoading,
    error: approvedError,
  } = useApprovalCountSeriesByApprover(
    userId ?? 0,
    { ...range },
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const {
    data: deletedData,
    isLoading: deletedLoading,
    error: deletedError,
  } = useDeletionSeriesByDeleter(
    userId ?? 0,
    { ...range },
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const dataset = useMemo(() => {
    return mergePointSeries({
      approved: approvedData || [],
      deleted: deletedData || [],
    });
  }, [approvedData, deletedData]);

  const chartProps: SeriesChartProps = {
    dataset,
    loading: approvedLoading || deletedLoading,
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) => formatSeriesDateLabel(value, dataset),
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
        dataKey: 'deleted',
        label: 'Deleted',
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
      data={[approvedData, deletedData]}
      isLoading={[approvedLoading, deletedLoading]}
      error={[approvedError, deletedError]}
      type="bars"
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
