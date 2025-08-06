import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';

import { usePostPendingSeries } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { formatSeriesDateLabel } from '../../utils/ranges';

export const PostPendingSeriesChart: React.FC = () => {
  const theme = useTheme();
  const range = useChartRange();

  const { data, isLoading, error } = usePostPendingSeries(
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
        loading={isLoading}
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
