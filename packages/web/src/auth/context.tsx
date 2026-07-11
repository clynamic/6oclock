import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { getMeQueryKey, useMe } from '../api';
import { AUTH_EXPIRED_EVENT } from '../http/axios';
import {
  login as beginLogin,
  logout as endSession,
} from '../http/credentials';

export interface AuthPayload {
  userId: number;
  username: string;
  level: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  payload: AuthPayload | null;
  login: (redirect?: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useMe({
    query: { retry: false, staleTime: Infinity, gcTime: Infinity },
  });

  useEffect(() => {
    const onExpired = () => {
      void queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  const payload = useMemo<AuthPayload | null>(
    () =>
      data
        ? {
            userId: Number(data.userId),
            username: data.username,
            level: data.level,
          }
        : null,
    [data],
  );

  const login = useCallback((redirect?: string | null) => {
    beginLogin(redirect);
  }, []);

  const logout = useCallback(async () => {
    await endSession();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: !!payload,
      isLoading,
      error: (error as AxiosError) ?? null,
      payload,
      login,
      logout,
    }),
    [payload, isLoading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
