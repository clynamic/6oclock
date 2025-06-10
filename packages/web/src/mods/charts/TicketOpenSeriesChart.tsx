import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';

import { useTicketOpenSeries } from '../../api';
import { QueryHint } from '../../common';
import {
  formatSeriesDateLabel,
  refetchQueryOptions,
  useChartRange,
} from '../../utils';

export const TicketOpenSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartRange();

  const { data, isLoading, error } = useTicketOpenSeries(
    range,
    refetchQueryOptions(),
  );

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      isEmpty={data?.every((e) => e.value === 0)}
      error={error}
      type="lines"
    >
      <LineChart
        dataset={data?.map((e) => ({ ...e })) ?? []}
        xAxis={[
          {
            scaleType: 'band',
            dataKey: 'date',
            valueFormatter: (value) => formatSeriesDateLabel(value, data!),
          },
        ]}
        series={[
          {
            dataKey: 'value',
            label: 'Open Tickets',
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
    </QueryHint>
  );
};
