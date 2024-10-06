import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { useTicketAgeSeries } from '../../api';
import { SeriesChartProps, useChartDateRange } from '../../utils';
import { TicketAgeColors, TicketAgeLabels } from './TicketAgeSummaryChart';

export const TicketAgeSeriesChart: React.FC = () => {
  const range = useChartDateRange();

  const { data } = useTicketAgeSeries(range);

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
        valueFormatter: (value) =>
          DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
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

  return <BarChart {...chartProps} />;
};
