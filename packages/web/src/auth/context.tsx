import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { jwtDecode } from 'jwt-decode';

import { clearAxiosAuth, setAxiosAuth } from '../http/credentials';

export interface AuthPayload {
  userId: number;
  username: string;
  level: string;
}

interface AuthContextType {
  token: string | null;
  saveToken: (token: string) => void;
  clearToken: () => void;
  payload: AuthPayload | null;
  session: Session | null;
  saveSession: (session: Session) => void;
  clearSession: () => void;
}

interface Session {
  date: Date;
  hash: string;
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

const storageKey = 'auth_token';

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem(storageKey);
    if (storedToken) {
      // This is necessary to ensure the first calls are already authenticated
      setAxiosAuth(storedToken);
    }
    return storedToken;
  });

  const saveToken = (token: string) => {
    setToken(token);
    localStorage.setItem(storageKey, token);
    setAxiosAuth(token);
  };

  const clearToken = () => {
    setToken(null);
    localStorage.removeItem(storageKey);
    clearAxiosAuth();
  };

  useEffect(() => {
    if (token) {
      setAxiosAuth(token);
    } else {
      clearAxiosAuth();
    }
  }, [token]);

  const [session, setSession] = useState<Session | null>(null);

  const saveSession = (newSession: Session) => {
    setSession(newSession);
  };

  const clearSession = () => {
    setSession(null);
  };

  useEffect(() => {
    setSession(null);
  }, [token]);

  const payload = useMemo(() => {
    if (!token) {
      return null;
    }
    const raw = jwtDecode<AuthPayload>(token);
    return {
      userId: Number(raw.userId),
      username: raw.username,
      level: raw.level,
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        saveToken,
        clearToken,
        payload,
        session,
        saveSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
