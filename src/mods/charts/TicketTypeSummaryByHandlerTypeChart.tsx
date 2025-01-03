import { PieChart, PieValueType } from '@mui/x-charts';
import { useMemo } from 'react';

import { TicketTypeSummary, useTicketTypeSummaryByHandler } from '../../api';
import { QueryHint } from '../../common';
import { refetchQueryOptions, useChartValue } from '../../utils';
import { TicketTypeColors } from './TicketTypeSummaryChart';

export const TicketTypeSummaryByHandlerTypeChart: React.FC = () => {
  const { range, userId } = useChartValue();
  const { data, isLoading, error } = useTicketTypeSummaryByHandler(
    userId ?? 0,
    range,
    refetchQueryOptions({
      enabled: !!userId,
    }),
  );

  const emptyQtypes = useMemo(() => {
    return Object.keys(data || {})
      .map((qtype) => qtype as keyof TicketTypeSummary)
      .filter((type) => data?.[type] === 0);
  }, [data]);

  const dataset: PieValueType[] = useMemo(() => {
    return Object.keys(data || {})
      .map((type) => type as keyof TicketTypeSummary)
      .filter((type) => !emptyQtypes.includes(type))
      .map((type, i) => ({
        id: i,
        label: type,
        value: data?.[type] || 0,
        color: TicketTypeColors[type],
      }))
      .sort((a, b) => b.value - a.value);
  }, [emptyQtypes, data]);

  return (
    <QueryHint data={dataset} isLoading={isLoading} error={error} type="pie">
      <PieChart
        sx={{ height: '100%' }}
        series={[
          {
            data: dataset,
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
    </QueryHint>
  );
};
