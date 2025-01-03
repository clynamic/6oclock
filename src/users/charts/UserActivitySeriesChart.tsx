import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { ActivitySeriesPoint, TimeScale, useActivity } from '../../api';
import { QueryHint } from '../../common';
import {
  flattenPointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartValue,
} from '../../utils';

export const UserActivitySeriesChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId, area } = useChartValue();

  const { data, isLoading, error } = useActivity(
    { ...range, cycle: TimeScale.day, userId: userId ?? 0, area },
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
    <QueryHint
      data={data}
      isLoading={isLoading}
      error={error}
      isEmpty={
        data
          ? flattenPointSeries<keyof Omit<ActivitySeriesPoint, 'date'>>(
              data,
            ).every((e) => e.value === 0)
          : false
      }
      type="bars"
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
