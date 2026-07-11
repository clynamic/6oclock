import React, { useEffect } from 'react';

import { Outlet, matchPath, useLocation, useNavigate } from 'react-router';

import { takePostLoginRedirect } from '../http/credentials';
import { useAuth } from './context';

export interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, error, payload } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const params = new URLSearchParams();
    if (location.pathname !== '/') {
      params.append('redirect', location.pathname);
    }
    const suffix = params.size > 0 ? `?${params.toString()}` : '';

    const status = error?.response?.status;
    const unreachable = !!error && (status === undefined || status >= 500);
    navigate(`${unreachable ? '/unreachable' : '/login'}${suffix}`, {
      replace: true,
    });
  }, [isAuthenticated, isLoading, error, location.pathname, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const redirect = takePostLoginRedirect();
    if (redirect && redirect.startsWith('/')) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (payload?.userId && matchPath('/users/me/*', location.pathname)) {
      navigate(
        location.pathname.replace('/users/me', `/users/${payload.userId}`),
        { replace: true },
      );
    }
  }, [location.pathname, navigate, payload?.userId]);

  if (isLoading || !isAuthenticated) return null;
  return children ? <>{children}</> : <Outlet />;
};
