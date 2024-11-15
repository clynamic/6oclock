import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import {
  useApprovalCountSeries,
  useDeletionCountSeries,
  useUploadCount,
} from '../../api';
import { QueryHint } from '../../common';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartDateRange,
} from '../../utils';

export const PostStatusCountSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const {
    data: approvedData,
    isLoading: approvedLoading,
    error: approvedError,
  } = useApprovalCountSeries(range, refetchQueryOptions());

  const {
    data: deletedData,
    isLoading: deletedLoading,
    error: deletedError,
  } = useDeletionCountSeries(range, refetchQueryOptions());

  const {
    data: uploadsData,
    isLoading: uploadsLoading,
    error: uploadsError,
  } = useUploadCount(range, refetchQueryOptions());

  const dataset = useMemo(() => {
    return mergePointSeries({
      approved: approvedData || [],
      deleted: deletedData || [],
      uploads: uploadsData || [],
    });
  }, [approvedData, deletedData, uploadsData]);

  const chartProps: SeriesChartProps = {
    dataset,
    loading: approvedLoading || deletedLoading || uploadsLoading,
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
        dataKey: 'uploads',
        label: 'Uploads',
        color: theme.palette.primary.main,
        stack: 'uploaded',
      },
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
      isLoading={[approvedLoading, deletedLoading, uploadsLoading]}
      error={[approvedError, deletedError, uploadsError]}
      type="bars"
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
