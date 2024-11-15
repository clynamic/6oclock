import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { useTicketActivitySummaryByHandler } from '../../api';
import { QueryHint } from '../../common';
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export const TicketActivitySummaryByHandlerChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data, isLoading, error } = useTicketActivitySummaryByHandler(
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
        dataKey: 'value',
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

  return (
    <QueryHint data={data} isLoading={isLoading} error={error} type="bars">
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
