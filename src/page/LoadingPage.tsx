import { CircularProgress, Stack, Typography } from '@mui/material';

import { Page } from './Page';
import { PageBody } from './PageBody';
import { PageFooter } from './PageFooter';
import { PageHeader } from './header/PageHeader';
import { PageTitle } from './PageTitle';

export interface LoadingPageProps {
  message?: React.ReactNode;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading...',
}) => {
  return (
    <Page>
      <PageTitle subtitle="Loading" />
      <PageHeader />
      <PageBody>
        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ height: '100%' }}
        >
          <CircularProgress size={48} />
          {message && <Typography variant="h6">{message}</Typography>}
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
