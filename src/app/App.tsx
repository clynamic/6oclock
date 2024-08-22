import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../login";
import { ModDashboard } from "../mods";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { AuthGuard, AuthProvider } from "../auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { NotFoundPage } from "./NotFound";
import { JanitorDashboard } from "../janitors/JanitorDashboard";
import { LocalCacheProvider } from "../cache";

export const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <AuthProvider>
      <LocalCacheProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={<AuthGuard />}>
                  <Route path="/" element={<Navigate to="/mods" />} />
                  <Route path="/mods" element={<ModDashboard />} />
                  <Route path="/janitors" element={<JanitorDashboard />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </LocalCacheProvider>
    </AuthProvider>
  );
};
