import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "../login";
import { ModDashboard } from "../mods";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { AuthGuard, AuthProvider } from "../auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

export const App = () => {
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
                <Route path="/" element={<ModDashboard />} />
                <Route path="/settings" element={<div>Settings</div>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};
