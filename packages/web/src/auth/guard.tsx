import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context";
import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { Box, CircularProgress, Typography } from "@mui/material";
import { checkCredentials, setAxiosAuth, clearAxiosAuth } from "../http";

export interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { credentials } = useAuth();
  const [loading, setLoading] = useState(true);

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

      if (credentials) {
        setLoading(true);

        const valid = await checkCredentials(credentials);

        if (!valid) {
          navigate(redirect, { replace: true });
          return;
        }

        setAxiosAuth(credentials);
        if (id !== sentinel.current) return;
        setLoading(false);
      } else {
        clearAxiosAuth();
        navigate(redirect, { replace: true });
      }
    };

    runCheck();
  }, [credentials, navigate]);

  if (loading) {
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
