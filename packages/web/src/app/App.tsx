import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthGuard, AuthProvider } from '../auth';
import { HealthPage } from '../health';
import { HomePage } from '../home';
import { LoginPage } from '../login';
import { NavigationEntryProvider } from '../page';
import { ProfilePage } from '../profile';
import { ChartParamsProvider } from '../utils';
import { LogoutPage } from './Logout';
import { appNavNodes, createRoutesFromNodes } from './navigation';
import { NotFoundPage } from './NotFound';
import { theme } from './theme';
import { UnreachablePage } from './Unreachable';

export const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <NavigationEntryProvider entries={appNavNodes}>
            <ChartParamsProvider>
              <CssBaseline />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/logout" element={<LogoutPage />} />

                  <Route path="/" element={<AuthGuard />}>
                    <Route path="/" element={<HomePage />} />

                    {...createRoutesFromNodes(appNavNodes)}

                    <Route path="/users/:id" element={<ProfilePage />} />
                    <Route path="/health" element={<HealthPage />} />
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
