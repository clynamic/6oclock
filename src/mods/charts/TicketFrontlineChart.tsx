import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { useTicketOpenSeries } from '../../api';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const TicketFrontlineChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data: series } = useTicketOpenSeries(range, refetchQueryOptions());

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
          dataKey: 'count',
          label: 'Open Tickets',
          color: theme.palette.primary.main,
        },
      ]}
      slotProps={{
        noDataOverlay: {
          message: 'No data',
        },
      }}
    />
  );
};
