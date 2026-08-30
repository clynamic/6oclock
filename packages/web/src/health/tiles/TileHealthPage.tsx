import { Box, Stack } from '@mui/material';

import { useTileHealth } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { TileHealthFrame } from './TileHealthFrame';

export const TileHealthPage: React.FC = () => {
  const { data, isLoading, error } = useTileHealth(
    // The board reads only the strip, so one page of months is plenty.
    { limit: 1 },
    { query: { refetchInterval: 10000 } },
  );

  return (
    <Page>
      <PageTitle subtitle="Tiles" />
      <PageHeader />
      <PageBody>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            marginInline: 'auto',
            p: 2,
            alignSelf: 'flex-start',
          }}
        >
          <QueryHint
            data={data}
            isLoading={isLoading}
            isEmpty={!data?.length}
            error={error}
            skeleton={
              <Stack sx={{ gap: 1 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <TileHealthFrame key={index} extended />
                ))}
              </Stack>
            }
          >
            <Stack sx={{ gap: 1 }}>
              {data?.map((tile) => (
                <TileHealthFrame key={tile.type} tile={tile} extended />
              ))}
            </Stack>
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
