import { Masonry } from '@mui/lab';
import { Box, Card, Stack, Typography } from '@mui/material';

import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';
import { JobsDisplay } from './Jobs';
import { ManifestHealthDisplay } from './ManifestHealth';

export const HealthPage: React.FC = () => {
  return (
    <Page>
      <PageTitle subtitle="Health" />
      <PageHeader />
      <PageBody>
        <Box sx={{ p: 1, width: '100%', height: '100%' }}>
          <Masonry
            columns={{ xs: 1, sm: 2, md: 3 }}
            spacing={2}
            sx={{
              alignSelf: 'start',
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
            <Card
              variant="outlined"
              sx={{
                background: 'transparent',
                height: '100%',
                maxHeight: 700,
              }}
            >
              <Stack p={2} spacing={2} sx={{ height: '100%' }}>
                <Typography variant="h5">Jobs</Typography>
                <JobsDisplay />
              </Stack>
            </Card>
          </Masonry>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
