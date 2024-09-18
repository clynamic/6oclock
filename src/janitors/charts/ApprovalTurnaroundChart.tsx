import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { useApprovalCountSeries } from '../../api';
import { SeriesChartProps, useChartDateRange } from '../../utils';

export interface ApprovalTurnaroundChartProps {
  variant?: 'bars' | 'lines';
}

export const ApprovalTurnaroundChart: React.FC<
  ApprovalTurnaroundChartProps
> = ({ variant = 'bars' }) => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: approvedData } = useApprovalCountSeries(range);

  const dataset = useMemo(() => {
    const dateMap: Record<string, { date: Date; approved: number }> = {};

    const dateString = (date: Date) => DateTime.fromJSDate(date).toISODate();

    if (approvedData) {
      for (const point of approvedData) {
        const date = dateString(point.date)!;
        if (!dateMap[date]) {
          dateMap[date] = { date: point.date, approved: 0 };
        }
        dateMap[date].approved = point.count;
      }
    }

    // uploads data goes here

    return Object.values(dateMap);
  }, [approvedData]);

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

  return <Chart {...chartProps} />;
};
