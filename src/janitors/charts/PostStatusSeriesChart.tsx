import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import {
  useApprovalCountSeries,
  useDeletionCountSeries,
  usePermitCount,
  useUploadCount,
} from '../../api';
import { QueryHint } from '../../common';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartRange,
} from '../../utils';

export const PostStatusCountSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartRange();

  const {
    data: approvedData,
    isLoading: approvedLoading,
    error: approvedError,
  } = useApprovalCountSeries(range, refetchQueryOptions());

  const {
    data: permittedData,
    isLoading: permittedLoading,
    error: permittedError,
  } = usePermitCount(range, refetchQueryOptions());

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
      permitted: permittedData || [],
      deleted: deletedData || [],
      uploads: uploadsData || [],
    });
  }, [approvedData, permittedData, deletedData, uploadsData]);

  const chartProps: SeriesChartProps = {
    dataset,
    loading:
      approvedLoading || permittedLoading || deletedLoading || uploadsLoading,
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
        dataKey: 'permitted',
        label: 'Permitted',
        color: theme.palette.success.light,
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
      data={[approvedData, permittedData, deletedData, uploadsData]}
      isLoading={[
        approvedLoading,
        permittedLoading,
        deletedLoading,
        uploadsLoading,
      ]}
      error={[approvedError, permittedError, deletedError, uploadsError]}
      type="bars"
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
