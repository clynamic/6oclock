import { Box, CircularProgress, Typography } from "@mui/material";
import { MD5 } from "crypto-js";
import { DateTime } from "luxon";
import React, { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { checkAuthToken } from "../http";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../page";
import { useAuth } from "./context";

export interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token, clearToken, session, saveSession, clearSession } = useAuth();
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
        const expired =
          DateTime.fromJSDate(session.date).plus({
            hours: 1,
          }) < DateTime.now();
        const hash = MD5(token).toString();
        const valid = hash === session.hash;
        if (expired || !valid) {
          clearSession();
        }
        return;
      }

      if (!token) {
        navigate(redirect, { replace: true });
        return;
      }

      const checkResult = await checkAuthToken(token);

      if (id !== sentinel.current) return;

      if (checkResult === "invalid") {
        clearToken();
        navigate(redirect, { replace: true });
        return;
      }

      if (checkResult === "error") {
        navigate("/unreachable", { replace: true });
        return;
      }

      saveSession({ date: new Date(), hash: MD5(token).toString() });
    };

    runCheck();
  }, [clearSession, clearToken, navigate, saveSession, session, token]);

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
