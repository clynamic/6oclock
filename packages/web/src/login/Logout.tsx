import { useEffect } from 'react';

import { Logout } from '@mui/icons-material';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/context';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { PageHeader } from '../page/header/PageHeader';

export const LogoutPage: React.FC = () => {
  const { clearToken } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    clearToken();
    queryClient.clear();
    setTimeout(() => {
      navigate('/');
    }, 3000);
  }, [clearToken, queryClient, navigate]);

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
