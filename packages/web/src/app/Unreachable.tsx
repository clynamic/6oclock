import { WifiTetheringOff } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useHealthCheck } from '../api';
import { PageBody } from '../page/PageBody';
import { PageTitle } from '../page/PageTitle';
import { PageFooter } from '../page/PageFooter';
import { Page } from '../page/Page';
import { PageHeader } from '../page/header/PageHeader';

export const UnreachablePage: React.FC = () => {
  const navigation = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [redirect, setRedirect] = useState<string | null>(null);

  const { data } = useHealthCheck({
    query: {
      refetchInterval: 10000,
      retry: false,
    },
  });

  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      const value = decodeURIComponent(redirectParam);
      if (value.startsWith('/')) {
        setRedirect(value);
      } else {
        console.error('Invalid redirect URL', value);
      }
      searchParams.delete('redirect');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (data) {
      navigation(redirect || '/');
    }
  }, [data, navigation, redirect]);

  return (
    <Page>
      <PageTitle subtitle="Unreachable" />
      <PageHeader />
      <PageBody>
        <Stack spacing={2} alignItems="center">
          <WifiTetheringOff sx={{ fontSize: 96 }} />
          <Typography>
            Oops! Look's like our servers are offline. Please try again later.
          </Typography>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
