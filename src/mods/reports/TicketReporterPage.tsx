import { Box, Stack } from '@mui/material';

import { useTicketReporterSummaryInfinite } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { PageHeader } from '../../page/header/PageHeader';
import { Page } from '../../page/Page';
import { PageTitle } from '../../page/PageTitle';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { useChartRange } from '../../utils/charts';
import { TicketReporterFrame } from './TicketReporterFrame';
import { LoadMoreHint } from '../../common/LoadMoreHint';

export const TicketReporterPage: React.FC = () => {
  const range = useChartRange();

  const { data, ...query } = useTicketReporterSummaryInfinite(
    {
      ...range,
    },
    {
      query: {
        refetchInterval: 1000 * 60 * 5,
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, i) => {
          if (lastPage.length === 0) {
            return undefined;
          }
          return (i ?? 1) + 1;
        },
      },
    },
  );

  return (
    <Page>
      <PageTitle subtitle="Reporters" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
          <QueryHint
            data={data?.pages}
            isLoading={query.isLoading}
            error={query.error}
          >
            <Stack sx={{ height: '100%', width: '100%', gap: 1 }}>
              {data?.pages
                .flat()
                .map((item, i) => (
                  <TicketReporterFrame key={i} summary={item} />
                ))}
            </Stack>
          </QueryHint>
          <LoadMoreHint query={query} />
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
