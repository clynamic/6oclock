import { Box } from '@mui/system';

import { useTileHealthInfinite } from '../../api';
import { LimitedList } from '../../common/LimitedList';
import { LoadMoreHint } from '../../common/LoadMoreHint';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { TileHealthFrame } from './TileHealthFrame';

export const TileHealthPage: React.FC = () => {
  const query = useTileHealthInfinite(
    {},
    {
      query: {
        getNextPageParam: (lastPage, pages) =>
          lastPage.length > 0 ? pages.length + 1 : undefined,
        initialPageParam: 1,
      },
    },
  );

  const tiles = query.data?.pages.flatMap((page) => page);

  return (
    <Page>
      <PageTitle subtitle="Tile Health" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
          <QueryHint
            data={tiles}
            isLoading={query.isLoading}
            isEmpty={!tiles?.length}
            error={query.error}
          >
            <LimitedList indicator={() => <LoadMoreHint query={query} />}>
              {tiles?.map((tile) => (
                <TileHealthFrame key={tile.type} tile={tile} extended={true} />
              ))}
            </LimitedList>
          </QueryHint>
          <LoadMoreHint query={query} />
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
