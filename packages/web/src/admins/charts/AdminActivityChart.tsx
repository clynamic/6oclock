import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import {
  useApprovalActivitySummaryByApprover,
  useDeletionActivitySummaryByDeleter,
  useTicketActivitySummaryByHandler,
} from '../../api';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export const AdminActivitySummaryByAdminChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const { data: ticketData } = useTicketActivitySummaryByHandler(
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
    return mergePointSeries({
      tickets: ticketData || [],
      approved: approvalData || [],
      deleted: deletionData || [],
    }).map((e) => ({
      date: e.date,
      value: e.tickets + e.approved + e.deleted,
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

  return <BarChart {...chartProps} />;
};
