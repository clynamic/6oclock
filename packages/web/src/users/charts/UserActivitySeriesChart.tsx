import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { GetActivitySeriesArea, useActivitySeries } from '../../api';
import { QueryHint } from '../../common';
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export interface UserActivitySeriesChartProps {
  area: GetActivitySeriesArea;
}

export const UserActivitySeriesChart: React.FC<
  UserActivitySeriesChartProps
> = ({ area }) => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data, isLoading, error } = useActivitySeries(
    { ...range, userId: userId ?? 0, area },
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const chartProps: SeriesChartProps = {
    dataset: data ? data?.map((e) => ({ ...e })) : [],
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) =>
          DateTime.fromJSDate(value).toLocaleString(DateTime.TIME_SIMPLE),
      },
    ],
    series: Object.keys(data?.[0] ?? {})
      .filter((key) => key !== 'date')
      .map((key) => ({
        dataKey: key,
        label: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase()),
        color: theme.palette.primary.main,
        stack: 'action',
      })),
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
