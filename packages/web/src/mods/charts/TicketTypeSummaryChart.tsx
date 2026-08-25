import { useMemo } from 'react';

import { PieChart, PieValueType } from '@mui/x-charts';

import { TicketTypeSummary, useTicketTypeSummary } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { TicketTypeColors } from './tickets';

export const TicketTypeSummaryChart: React.FC = () => {
  const range = useChartRange();
  const { data, isLoading, error } = useTicketTypeSummary(
    range,
    refetchQueryOptions(),
  );

  const emptyTypes = useMemo(() => {
    return Object.keys(data || {})
      .map((qtype) => qtype as keyof TicketTypeSummary)
      .filter((type) => data?.[type] === 0);
  }, [data]);

  const dataset: PieValueType[] = useMemo(() => {
    return Object.keys(data || {})
      .map((type) => type as keyof TicketTypeSummary)
      .filter((type) => !emptyTypes.includes(type))
      .map((type, i) => ({
        id: i,
        label: type,
        value: data?.[type] || 0,
        color: TicketTypeColors[type],
      }))
      .sort((a, b) => b.value - a.value);
  }, [emptyTypes, data]);

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
          legend: {
            sx: {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 2,
            },
          },
        }}
        localeText={{ noData: 'No data' }}
      />
    </QueryHint>
  );
};
