import { Box, Stack } from '@mui/material';

import { usePerformance, UserArea } from '../api';
import { QueryHint } from '../common';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';
import { refetchQueryOptions, useChartRange } from '../utils';
import { PerformanceFrame } from './PerformanceFrame';

export interface PerformancePageProps {
  area?: UserArea;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({ area }) => {
  const range = useChartRange();

  const { data, isLoading, error } = usePerformance(
    {
      ...range,
      area,
      head: true,
    },
    refetchQueryOptions(),
  );

  return (
    <Page>
      <PageTitle subtitle="Ticketers" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
          <QueryHint isLoading={isLoading} error={error}>
            <Stack sx={{ height: '100%', width: '100%', gap: 1 }}>
              {data?.map((item, i) => (
                <PerformanceFrame key={i} summary={item} />
              ))}
            </Stack>
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
