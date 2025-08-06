import { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';

import {
  useApprovalCountSeries,
  useDeletionCountSeries,
  usePermitCount,
  useUploadCount,
} from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { SeriesChartProps, useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { formatSeriesDateLabel } from '../../utils/ranges';
import { isPointSeriesEmpty, mergePointSeries } from '../../utils/series';

export const PostStatusSeriesChart: React.FC = () => {
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
        valueFormatter: (value) => formatSeriesDateLabel(value, dataset),
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
      isEmpty={isPointSeriesEmpty(dataset)}
      error={[approvedError, permittedError, deletedError, uploadsError]}
      type="bars"
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
