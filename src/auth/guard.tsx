import React, { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context";
import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { Box, CircularProgress, Typography } from "@mui/material";
import { checkCredentials, setAxiosAuth, clearAxiosAuth } from "../http";
import dayjs from "dayjs";

export interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { credentials, session, saveSession, clearSession } = useAuth();
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

      if (credentials && session) {
        if (dayjs(session.date).add(1, "day").isBefore(dayjs())) {
          clearSession();
        }
        return;
      }

      if (!credentials) {
        clearAxiosAuth();
        navigate(redirect, { replace: true });
        return;
      }

      const valid = await checkCredentials(credentials);

      if (!valid) {
        navigate(redirect, { replace: true });
        return;
      }

      setAxiosAuth(credentials);
      saveSession({ date: new Date(), hash: "TODO" });
      if (id !== sentinel.current) return;
    };

    runCheck();
  }, [credentials, session, navigate, saveSession, clearSession]);

  if (!hasSession) {
    return (
      <Page>
        <WindowTitle subtitle="Authenticating..." />
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
