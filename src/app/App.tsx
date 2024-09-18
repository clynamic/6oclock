import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthGuard, AuthProvider } from '../auth';
import { HomePage } from '../home';
import { ApproverPage, JanitorOverviewPage } from '../janitors';
import { LoginPage } from '../login';
import { ModOverviewPage, TicketerPage, TicketReporterPage } from '../mods';
import { NavigationEntryProvider } from '../page';
import { ProfilePage } from '../profile';
import { ChartParamsProvider } from '../utils';
import { navigationEntries } from './navigation';
import { NotFoundPage } from './NotFound';
import { theme } from './theme';
import { UnreachablePage } from './Unreachable';

export const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <NavigationEntryProvider entries={navigationEntries}>
            <ChartParamsProvider>
              <CssBaseline />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  <Route path="/" element={<AuthGuard />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/mods" element={<ModOverviewPage />} />
                    <Route path="/mods/tickets" element={<TicketerPage />} />
                    <Route
                      path="/mods/reports"
                      element={<TicketReporterPage />}
                    />
                    <Route path="/janitors" element={<JanitorOverviewPage />} />
                    <Route
                      path="/janitors/approvals"
                      element={<ApproverPage />}
                    />
                    <Route path="/users/:id" element={<ProfilePage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                  <Route path="/unreachable" element={<UnreachablePage />} />
                </Routes>
              </BrowserRouter>
            </ChartParamsProvider>
          </NavigationEntryProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};
