import { Box, CircularProgress, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { checkAuthToken, clearAxiosAuth, setAxiosAuth } from "../http";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../page";
import { useAuth } from "./context";

export interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token, session, saveSession, clearSession } = useAuth();
  const hasSession = useMemo(() => !!session, [session]);

  const sentinel = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();
  const path = useRef(location.pathname);

  useEffect(() => {
    path.current = location.pathname;
  }, [location]);

  useEffect(() => {
    const runCheck = async () => {
      const id = ++sentinel.current;

      let redirect = "/login";
      const params = new URLSearchParams();
      if (path.current !== "/") {
        params.append("redirect", path.current);
      }
      if (params.size > 0) {
        redirect += `?${params.toString()}`;
      }

      if (token && session) {
        if (dayjs(session.date).add(1, "day").isBefore(dayjs())) {
          clearSession();
        }
        return;
      }

      if (!token) {
        clearAxiosAuth();
        navigate(redirect, { replace: true });
        return;
      }

      const valid = await checkAuthToken(token);

      if (!valid) {
        navigate(redirect, { replace: true });
        return;
      }

      setAxiosAuth(token);
      saveSession({ date: new Date(), hash: "TODO" });
      if (id !== sentinel.current) return;
    };

    runCheck();
  }, [clearSession, navigate, saveSession, session, token]);

  if (!hasSession) {
    return (
      <Page>
        <PageTitle subtitle="Authenticating..." />
        <PageHeader />
        <PageBody>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="h6">Checking your credentials...</Typography>
          </Box>
        </PageBody>
        <PageFooter />
      </Page>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
