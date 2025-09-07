import { lazy, useMemo } from 'react';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../auth/context';
import { AuthGuard } from '../auth/guard';
import { SuspensePage } from '../page/SuspensePage';
import { NavigationEntryProvider } from '../page/navigation';
import { SafeModeProvider } from '../settings/SafeModeContext';
import { ChartParamsProvider } from '../utils/charts';
import { appNavNodes, createRoutesFromNodes } from './navigation';
import { theme } from './theme';

const LoginPage = lazy(() =>
  import('../login/Login').then((m) => ({ default: m.LoginPage })),
);
const LogoutPage = lazy(() =>
  import('../login/Logout').then((m) => ({ default: m.LogoutPage })),
);
const NotFoundPage = lazy(() =>
  import('./NotFound').then((m) => ({ default: m.NotFoundPage })),
);
const UnreachablePage = lazy(() =>
  import('./Unreachable').then((m) => ({ default: m.UnreachablePage })),
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
                      element={<SuspensePage children={<LoginPage />} />}
                    />
                    <Route
                      path="/logout"
                      element={<SuspensePage children={<LogoutPage />} />}
                    />

                    <Route path="/" element={<AuthGuard />}>
                      {...createRoutesFromNodes(appNavNodes)}
                    </Route>

                    <Route
                      path="*"
                      element={<SuspensePage children={<NotFoundPage />} />}
                    />
                    <Route
                      path="/unreachable"
                      element={<SuspensePage children={<UnreachablePage />} />}
                    />
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
