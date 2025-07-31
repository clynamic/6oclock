import { Stack, Typography } from '@mui/material';

import { PageBody } from '../page/PageBody';
import { PageTitle } from '../page/PageTitle';
import { PageFooter } from '../page/PageFooter';
import { Page } from '../page/Page';
import { PageHeader } from '../page/header/PageHeader';

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
