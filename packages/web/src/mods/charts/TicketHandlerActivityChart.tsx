import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { useTicketActivitySummaryByHandler } from '../../api';
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export const TicketHandlerActivityChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data } = useTicketActivitySummaryByHandler(
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
        label: 'Action',
        color: theme.palette.primary.main,
      },
    ],
    slotProps: {
      legend: {
        hidden: true,
      },
      noDataOverlay: {
        message: 'No data',
      },
    },
  };

  return <BarChart {...chartProps} />;
};
