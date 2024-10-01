import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import {
  useApprovalActivitySummaryByApprover,
  useDeletionActivitySummaryByDeleter,
  useTicketActivitySummaryForHandler,
} from '../../api';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export const AdminActivityChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data: ticketData } = useTicketActivitySummaryForHandler(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const { data: approvalData } = useApprovalActivitySummaryByApprover(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const { data: deletionData } = useDeletionActivitySummaryByDeleter(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const dataset = useMemo(() => {
    return mergePointSeries(
      {
        tickets: ticketData || [],
        approved: approvalData || [],
        deleted: deletionData || [],
      },
      'time',
    ).map((e) => ({
      date: e.date,
      count: e.tickets + e.approved + e.deleted,
    }));
  }, [approvalData, deletionData, ticketData]);

  const chartProps: SeriesChartProps = {
    dataset: dataset?.map((e) => ({ ...e })) ?? [],
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
