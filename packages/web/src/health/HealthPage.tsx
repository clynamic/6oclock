import { Masonry } from '@mui/lab';
import { Card, Stack, Typography } from '@mui/material';

import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';
import { ManifestHealthDisplay } from './ManifestHealth';

export const HealthPage: React.FC = () => {
  return (
    <Page>
      <PageTitle subtitle="Health" />
      <PageHeader />
      <PageBody>
        <Masonry
          columns={{ xs: 1, sm: 2, md: 3 }}
          spacing={2}
          sx={{
            p: 0.5,
            height: '100%',
          }}
        >
          <Card
            variant="outlined"
            sx={{
              background: 'transparent',
            }}
          >
            <Stack p={2} spacing={2}>
              <Typography variant="h5">Manifests</Typography>
              <ManifestHealthDisplay />
            </Stack>
          </Card>
        </Masonry>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
