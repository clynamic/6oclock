import { Stack, Typography } from '@mui/material';

import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';

export const NotFoundPage: React.FC = () => {
  return (
    <Page>
      <PageTitle subtitle="Not Found" />
      <PageHeader />
      <PageBody>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h1">404</Typography>
          <Typography>Nothing here but us chickens. 🐔</Typography>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
