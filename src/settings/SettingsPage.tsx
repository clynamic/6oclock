import { Logout, Shield, ShieldOutlined } from '@mui/icons-material';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { useSafeMode } from './SafeModeContext';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageHeader } from '../page/header/PageHeader';
import { PageTitle } from '../page/PageTitle';

export const SettingsPage: React.FC = () => {
  const { safeMode, setSafeMode } = useSafeMode();

  return (
    <Page>
      <PageTitle subtitle="Settings" />
      <PageHeader />
      <PageBody>
        <Stack spacing={3} sx={{ maxWidth: 600, p: 2 }}>
          <Typography variant="h5" component="h1">
            Settings
          </Typography>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">
                  Safe Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hide explicit content from your browsing experience.
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setSafeMode(!safeMode)}
                  startIcon={safeMode ? <Shield /> : <ShieldOutlined />}
                  color={safeMode ? 'success' : 'warning'}
                >
                  {safeMode ? 'Enabled' : 'Disabled'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">
                  Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign out of your account and return to the login page.
                </Typography>
                <Button
                  component={Link}
                  to="/logout"
                  variant="outlined"
                  color="error"
                  startIcon={<Logout />}
                  fullWidth
                  size="large"
                >
                  Log out
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
