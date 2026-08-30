import { Box, Stack } from '@mui/material';

import { useManifestHealth } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { ManifestHealthFrame } from './ManifestHealthFrame';

export const ManifestHealthPage: React.FC = () => {
  const { data, isLoading, error } = useManifestHealth({
    query: { refetchInterval: 10000 },
  });

  return (
    <Page>
      <PageTitle subtitle="Manifests" />
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
                {Array.from({ length: 8 }).map((_, index) => (
                  <ManifestHealthFrame key={index} extended />
                ))}
              </Stack>
            }
          >
            <Stack sx={{ gap: 1 }}>
              {data?.map((manifest) => (
                <ManifestHealthFrame
                  key={manifest.type}
                  manifest={manifest}
                  extended
                />
              ))}
            </Stack>
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
