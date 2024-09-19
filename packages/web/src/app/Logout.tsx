import { Logout } from '@mui/icons-material';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';

export const LogoutPage: React.FC = () => {
  const { clearToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearToken();
    setTimeout(() => {
      navigate('/');
    }, 3000);
  }, [clearToken, navigate]);

  return (
    <Page>
      <PageTitle subtitle="Logging out..." />
      <PageHeader />
      <PageBody>
        <Stack spacing={2} alignItems="center">
          <Logout sx={{ fontSize: 96 }} />
          <Typography>You are being logged out.</Typography>
          <CircularProgress />
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
