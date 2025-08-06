import React, { useEffect, useRef } from 'react';

import MD5 from 'crypto-js/md5';
import { addHours, isBefore } from 'date-fns';
import { Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';

import { checkAuthToken } from '../http/credentials';
import { useAuth } from './context';

export interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token, clearToken, session, saveSession, clearSession, payload } =
    useAuth();
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

      let loginUrl = '/login';
      let unreachableUrl = '/unreachable';
      const params = new URLSearchParams();
      if (path.current !== '/') {
        params.append('redirect', path.current);
      }
      if (params.size > 0) {
        loginUrl += `?${params.toString()}`;
        unreachableUrl += `?${params.toString()}`;
      }

      if (token && session) {
        const expired = isBefore(addHours(session.date, 1), new Date());
        const hash = MD5(token).toString();
        const valid = hash === session.hash;
        if (expired || !valid) {
          clearSession();
        }
        return;
      }

      if (!token) {
        navigate(loginUrl, { replace: true });
        return;
      }

      const checkResult = await checkAuthToken(token);

      if (id !== sentinel.current) return;

      if (checkResult === 'invalid') {
        clearToken();
        navigate(loginUrl, { replace: true });
        return;
      }

      if (checkResult === 'error') {
        navigate(unreachableUrl, { replace: true });
        return;
      }

      saveSession({ date: new Date(), hash: MD5(token).toString() });
    };

    runCheck();
  }, [clearSession, clearToken, navigate, saveSession, session, token]);

  useEffect(() => {
    if (payload?.userId) {
      const isUserMePath = matchPath('/users/me/*', location.pathname);

      if (isUserMePath) {
        const newPath = location.pathname.replace(
          '/users/me',
          `/users/${payload.userId}`,
        );
        navigate(newPath, { replace: true });
      }
    }
  }, [location.pathname, navigate, payload?.userId]);

  return children ? <>{children}</> : <Outlet />;
};
