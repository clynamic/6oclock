import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';

import { usePostPendingSeries } from '../../api';
import { QueryHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';

export const PostPendingSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartDateRange();

  const { data, isLoading, error } = usePostPendingSeries(
    range,
    refetchQueryOptions(),
  );

  return (
    <QueryHint isLoading={isLoading} error={error} type="lines">
      <LineChart
        dataset={data?.map((e) => ({ ...e })) ?? []}
        loading={isLoading}
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
            dataKey: 'value',
            label: 'Pending Posts',
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
