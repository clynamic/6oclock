import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import {
  useApprovalCountSeries,
  useDeletionCountSeries,
  useUploadCount,
} from '../../api';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartDateRange,
} from '../../utils';

export const PostStatusCountSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: approvedData } = useApprovalCountSeries(
    range,
    refetchQueryOptions(),
  );

  const { data: deletedData } = useDeletionCountSeries(
    range,
    refetchQueryOptions(),
  );

  const { data: uploadsData } = useUploadCount(range, refetchQueryOptions());

  const dataset = useMemo(() => {
    return mergePointSeries({
      approved: approvedData || [],
      deleted: deletedData || [],
      uploads: uploadsData || [],
    });
  }, [approvedData, deletedData, uploadsData]);

  const chartProps: SeriesChartProps = {
    loading: !approvedData || !deletedData || !uploadsData,
    dataset,
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

  return <BarChart {...chartProps} />;
};
