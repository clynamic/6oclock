import { useMemo } from 'react';

import { Box } from '@mui/material';

import { useJobsInfinite } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { VirtualizedList } from '../../common/VirtualizedList';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { JobsFrame } from './JobsFrame';

export const JobsPage: React.FC = () => {
  const { data, ...query } = useJobsInfinite(undefined, {
    query: {
      refetchInterval: 10000,
      initialPageParam: 1,
      getNextPageParam: (lastPage, _, i) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return (i ?? 1) + 1;
      },
    },
  });

  const items = useMemo(() => data?.pages.flat() ?? [], [data?.pages]);

  return (
    <Page>
      <PageTitle subtitle="Jobs" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
          <QueryHint
            data={data?.pages}
            isLoading={query.isLoading}
            error={query.error}
          >
            <VirtualizedList
              items={items}
              renderItem={(_, item) => <JobsFrame job={item} />}
              query={query}
            />
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
