import { useMemo } from 'react';

import { Box } from '@mui/material';

import { useTileHealthInfinite } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { VirtualizedList } from '../../common/VirtualizedList';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { TileHealthFrame } from './TileHealthFrame';

export const TileHealthPage: React.FC = () => {
  const { data, ...query } = useTileHealthInfinite(
    {},
    {
      query: {
        getNextPageParam: (lastPage, pages) =>
          lastPage.length > 0 ? pages.length + 1 : undefined,
        initialPageParam: 1,
      },
    },
  );

  const items = useMemo(() => data?.pages.flat() ?? [], [data?.pages]);

  return (
    <Page>
      <PageTitle subtitle="Tile Health" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
          <QueryHint
            data={data?.pages}
            isLoading={query.isLoading}
            isEmpty={!items.length}
            error={query.error}
          >
            <VirtualizedList
              items={items}
              renderItem={(_, tile) => (
                <TileHealthFrame tile={tile} extended={true} />
              )}
              query={query}
            />
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
