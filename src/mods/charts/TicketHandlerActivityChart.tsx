import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { useTicketActivitySummaryForHandler } from '../../api';
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export const TicketHandlerActivityChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data } = useTicketActivitySummaryForHandler(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const chartProps: SeriesChartProps = {
    dataset: data?.map((e) => ({ ...e })) ?? [],
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) =>
          DateTime.fromJSDate(value).toLocaleString(DateTime.TIME_SIMPLE),
      },
    ],
    series: [
      {
        dataKey: 'count',
        label: 'Closed',
        color: theme.palette.primary.main,
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
