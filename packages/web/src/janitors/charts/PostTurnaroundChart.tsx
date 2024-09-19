import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { useApprovalCountSeries, useDeletionSeries } from '../../api';
import {
  mergePointSeries,
  SeriesChartProps,
  useChartDateRange,
} from '../../utils';

export const PostTurnaroundChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: approvedData } = useApprovalCountSeries(range);

  const { data: deletedData } = useDeletionSeries(range);

  const dataset = useMemo(() => {
    return mergePointSeries({
      approved: approvedData || [],
      deleted: deletedData || [],
    });
  }, [approvedData, deletedData]);

  const chartProps: SeriesChartProps = {
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
