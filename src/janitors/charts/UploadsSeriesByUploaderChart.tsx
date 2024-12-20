import { useTheme } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { useUploadCount } from '../../api';
import { QueryHint } from '../../common';
import {
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export interface UploadsUploaderChartProps {
  variant?: 'bars' | 'lines';
}

export const UploadsSeriesByUploaderChart: React.FC<
  UploadsUploaderChartProps
> = ({ variant = 'bars' }) => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data, isLoading, error } = useUploadCount(
    {
      uploaderId: userId ?? 0,
      ...range,
    },
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
          DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
      },
    ],
    series: [
      {
        dataKey: 'value',
        label: 'Uploads',
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

  const Chart = useMemo(() => {
    return variant === 'bars' ? BarChart : LineChart;
  }, [variant]);

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      isEmpty={data?.every((e) => e.value === 0)}
      error={error}
      type={variant}
    >
      <Chart {...chartProps} />
    </QueryHint>
  );
};
