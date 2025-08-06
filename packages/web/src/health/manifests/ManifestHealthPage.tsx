import { Box, Stack } from '@mui/material';

import { useManifestHealthInfinite } from '../../api';
import { LoadMoreHint } from '../../common/LoadMoreHint';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { ManifestHealthFrame } from './ManifestHealthFrame';

export const ManifestHealthPage: React.FC = () => {
  const { data, ...query } = useManifestHealthInfinite(undefined, {
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

  return (
    <Page>
      <PageTitle subtitle="Manifest Health" />
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
                .map((item) => (
                  <ManifestHealthFrame
                    key={item.id}
                    manifest={item}
                    extended={true}
                  />
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
