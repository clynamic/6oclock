import { useMemo } from 'react';

import { Box } from '@mui/material';

import { usePostUploaderSummaryInfinite } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { VirtualizedList } from '../../common/VirtualizedList';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { useChartRange } from '../../utils/charts';
import { PostUploaderFrame } from './PostUploaderFrame';

export const PostUploaderPage: React.FC = () => {
  const range = useChartRange();

  const { data, ...query } = usePostUploaderSummaryInfinite(
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

  const items = useMemo(() => data?.pages.flat() ?? [], [data?.pages]);

  return (
    <Page>
      <PageTitle subtitle="Uploaders" />
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
              renderItem={(_, item) => <PostUploaderFrame summary={item} />}
              query={query}
            />
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
