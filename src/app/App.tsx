import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../auth/context';
import { AuthGuard } from '../auth/guard';
import { LoadingPage } from '../page/LoadingPage';
import { NavigationEntryProvider } from '../page/navigation';
import { ChartParamsProvider } from '../utils/charts';
import { LogoutPage } from './Logout';
import { appNavNodes, createRoutesFromNodes } from './navigation';
import { NotFoundPage } from './NotFound';
import { theme } from './theme';
import { UnreachablePage } from './Unreachable';

const LoginPage = lazy(() =>
  import('../login/Login').then((m) => ({ default: m.LoginPage })),
);

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
    </AuthProvider>
  );
};
