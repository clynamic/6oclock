import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthGuard, AuthProvider } from "../auth";
import { HomePage } from "../home";
import { JanitorDashboard } from "../janitors";
import { LoginPage } from "../login";
import { ModDashboardPage, TicketerPage, TicketReporterPage } from "../mods";
import { NotFoundPage } from "./NotFound";
import { theme } from "./theme";
import { UnreachablePage } from "./Unreachable";

export const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route path="/" element={<AuthGuard />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/mods" element={<ModDashboardPage />} />
                <Route path="/mods/tickets" element={<TicketerPage />} />
                <Route path="/mods/reports" element={<TicketReporterPage />} />
                <Route path="/janitors" element={<JanitorDashboard />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
              <Route path="/unreachable" element={<UnreachablePage />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};
