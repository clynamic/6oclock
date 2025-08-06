import { Suspense, lazy, useMemo } from 'react';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../auth/context';
import { AuthGuard } from '../auth/guard';
import { LoadingPage } from '../page/LoadingPage';
import { NavigationEntryProvider } from '../page/navigation';
import { SafeModeProvider } from '../settings/SafeModeContext';
import { ChartParamsProvider } from '../utils/charts';
import { LogoutPage } from './Logout';
import { NotFoundPage } from './NotFound';
import { UnreachablePage } from './Unreachable';
import { appNavNodes, createRoutesFromNodes } from './navigation';
import { theme } from './theme';

const LoginPage = lazy(() =>
  import('../login/Login').then((m) => ({ default: m.LoginPage })),
);

export const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <AuthProvider>
      <SafeModeProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <NavigationEntryProvider entries={appNavNodes}>
              <ChartParamsProvider>
                <CssBaseline />
                <BrowserRouter>
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        <Suspense fallback={<LoadingPage />}>
                          <LoginPage />
                        </Suspense>
                      }
                    />
                    <Route path="/logout" element={<LogoutPage />} />

                    <Route path="/" element={<AuthGuard />}>
                      {...createRoutesFromNodes(appNavNodes)}
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/unreachable" element={<UnreachablePage />} />
                  </Routes>
                </BrowserRouter>
              </ChartParamsProvider>
            </NavigationEntryProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeModeProvider>
    </AuthProvider>
  );
};
