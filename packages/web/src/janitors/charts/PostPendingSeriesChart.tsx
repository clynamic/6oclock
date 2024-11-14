import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { usePostPendingSeries } from '../../api';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const PostPendingSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: series } = usePostPendingSeries(range, refetchQueryOptions());

  return (
    <LineChart
      dataset={series?.map((e) => ({ ...e })) ?? []}
      xAxis={[
        {
          scaleType: 'band',
          dataKey: 'date',
          valueFormatter: (value) =>
            DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
        },
      ]}
      series={[
        {
          dataKey: 'value',
          label: 'Pending Posts',
          color: theme.palette.primary.main,
        },
      ]}
      slotProps={{
        legend: {
          hidden: true,
        },
        noDataOverlay: {
          message: 'No data',
        },
      }}
    />
  );
};
