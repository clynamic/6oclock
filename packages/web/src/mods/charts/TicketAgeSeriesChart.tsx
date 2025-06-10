import { BarChart } from '@mui/x-charts';
import { useMemo } from 'react';

import { useTicketAgeSeries } from '../../api';
import { QueryHint } from '../../common';
import {
  formatSeriesDateLabel,
  SeriesChartProps,
  useChartRange,
} from '../../utils';
import { TicketAgeColors, TicketAgeLabels } from './TicketAgeSummaryChart';

export const TicketAgeSeriesChart: React.FC = () => {
  const range = useChartRange();

  const { data, isLoading, error } = useTicketAgeSeries(range);

  const dataset = useMemo(() => {
    return (
      data?.map((e) => ({
        ...e,
      })) ?? []
    );
  }, [data]);

  const chartProps: SeriesChartProps = {
    dataset,
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) => formatSeriesDateLabel(value, dataset),
      },
    ],
    series: (
      Object.entries(TicketAgeColors) as [
        keyof typeof TicketAgeColors,
        string,
      ][]
    )
      .map(([key, color]) => ({
        dataKey: key,
        label: TicketAgeLabels[key],
        color,
        stack: 'age',
      }))
      .sort(
        (a, b) =>
          Object.keys(TicketAgeLabels).indexOf(b.dataKey) -
          Object.keys(TicketAgeLabels).indexOf(a.dataKey),
      ),
    slotProps: {
      noDataOverlay: {
        message: 'No data',
      },
    },
  };

  return (
    <QueryHint data={data} isLoading={isLoading} error={error} type="bars">
      <BarChart {...chartProps} />;
    </QueryHint>
  );
};
