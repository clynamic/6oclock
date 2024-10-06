import { PieChart, PieValueType } from '@mui/x-charts';
import { useMemo } from 'react';

import { TicketTypeSummary, useTicketTypeSummaryByHandler } from '../../api';
import { refetchQueryOptions, useChartParamsValue } from '../../utils';
import { TicketTypeColors } from './TicketTypeSummaryChart';

export const TicketTypeSummaryByHandlerTypeChart: React.FC = () => {
  const { range, userId } = useChartParamsValue();
  const { data: summary } = useTicketTypeSummaryByHandler(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const emptyQtypes = useMemo(() => {
    return Object.keys(summary || {})
      .map((qtype) => qtype as keyof TicketTypeSummary)
      .filter((type) => summary?.[type] === 0);
  }, [summary]);

  const data: PieValueType[] = useMemo(() => {
    return Object.keys(summary || {})
      .map((type) => type as keyof TicketTypeSummary)
      .filter((type) => !emptyQtypes.includes(type))
      .map((type, i) => ({
        id: i,
        label: type,
        value: summary?.[type] || 0,
        color: TicketTypeColors[type],
      }))
      .sort((a, b) => b.value - a.value);
  }, [emptyQtypes, summary]);

  return (
    <PieChart
      sx={{ height: '100%' }}
      series={[
        {
          data: data,
          arcLabel: (item) => `${item.value}`,
          arcLabelMinAngle: 20,
          innerRadius: '30%',
          outerRadius: '90%',
          paddingAngle: 5,
          cornerRadius: 5,
          cx: '50%',
          cy: '50%',
        },
      ]}
      slotProps={{
        noDataOverlay: {
          message: 'No data',
        },
      }}
      margin={{
        right: 150,
      }}
    />
  );
};
