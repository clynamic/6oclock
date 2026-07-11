import { useEffect } from 'react';

import { Logout } from '@mui/icons-material';
import { CircularProgress, Stack, Typography } from '@mui/material';

import { useAuth } from '../auth/context';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { PageHeader } from '../page/header/PageHeader';

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    void logout().finally(() => {
      window.location.replace('/login');
    });
  }, [logout]);

  return (
    <Page>
      <PageTitle subtitle="Logging out..." />
      <PageHeader />
      <PageBody>
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
          <Logout sx={{ fontSize: 96 }} />
          <Typography>You are being logged out.</Typography>
          <CircularProgress />
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
