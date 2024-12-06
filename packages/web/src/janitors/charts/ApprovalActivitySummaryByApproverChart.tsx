import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import {
  useApprovalActivitySummaryByApprover,
  useDeletionActivitySummaryByDeleter,
} from '../../api';
import { QueryHint } from '../../common';
import {
  mergePointSeries,
  refetchQueryOptions,
  SeriesChartProps,
  useChartParamsValue,
} from '../../utils';

export const ApprovalActivitySummaryByApproverChart: React.FC = () => {
  const theme = useTheme();
  const { range, userId } = useChartParamsValue();

  const {
    data: approvalData,
    isLoading: approvalLoading,
    error: approvalError,
  } = useApprovalActivitySummaryByApprover(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const {
    data: deletionData,
    isLoading: deletionLoading,
    error: deletionError,
  } = useDeletionActivitySummaryByDeleter(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const dataset = useMemo(() => {
    return mergePointSeries({
      approved: approvalData || [],
      deleted: deletionData || [],
    }).map((e) => ({
      date: e.date,
      value: e.approved + e.deleted,
    }));
  }, [approvalData, deletionData]);

  const chartProps: SeriesChartProps = {
    dataset: dataset?.map((e) => ({ ...e })) ?? [],
    loading: approvalLoading || deletionLoading,
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

  return (
    <QueryHint
      type="bars"
      data={[approvalData, deletionData]}
      isLoading={[approvalLoading, deletionLoading]}
      error={[approvalError, deletionError]}
    >
      <BarChart {...chartProps} />
    </QueryHint>
  );
};
