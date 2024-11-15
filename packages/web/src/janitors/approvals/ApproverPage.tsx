import { Box, Stack } from '@mui/material';

import { useApproverSummaryInfinite } from '../../api';
import { LoadMoreHint, QueryHint } from '../../common';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../../page';
import { useChartDateRange } from '../../utils';
import { ApproverFrame } from './ApproverFrame';

export const ApproverPage: React.FC = () => {
  const range = useChartDateRange();

  const { data, ...query } = useApproverSummaryInfinite(
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
      <PageTitle subtitle="Approvers" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
          <QueryHint isLoading={query.isLoading} error={query.error}>
            <Stack sx={{ height: '100%', width: '100%', gap: 1 }}>
              {data?.pages
                .flat()
                .map((item, i) => <ApproverFrame key={i} summary={item} />)}
            </Stack>
          </QueryHint>
          <LoadMoreHint query={query} />
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
