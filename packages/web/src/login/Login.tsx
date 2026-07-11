import { useState } from 'react';

import {
  Box,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router';

import { useAuth } from '../auth/context';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { PageHeader } from '../page/header/PageHeader';
import { LoginButton } from './LoginButton';

export const LoginPage = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [redirect] = useState<string | null>(() => {
    const param = searchParams.get('redirect');
    if (!param) return null;
    const value = decodeURIComponent(param);
    if (value.startsWith('/')) return value;
    console.error('Invalid redirect URL', value);
    return null;
  });

  const onLogin = () => {
    setLoading(true);
    login(redirect);
  };

  return (
    <Page>
      <PageTitle subtitle="Punch in!" />
      <PageHeader />
      <PageBody>
        <Container
          maxWidth="sm"
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card sx={{ width: '100%' }}>
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 4,
                },
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h4">6 o'clock</Typography>
                <Typography variant="body1">
                  Welcome back! Log in to continue.
                </Typography>
              </Stack>
            </CardContent>
            <CardActions>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '100%',
                  p: 1,
                }}
              >
                <LoginButton loading={loading} onClick={onLogin} />
              </Box>
            </CardActions>
          </Card>
        </Container>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
