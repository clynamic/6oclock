import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { clearAxiosAuth, setAxiosAuth } from "../http";

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
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

const storageKey = "auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(storageKey);
  });

  const saveToken = (token: string) => {
    setToken(token);
    localStorage.setItem(storageKey, token);
  };

  const clearToken = () => {
    setToken(null);
    localStorage.removeItem(storageKey);
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
    return jwtDecode<AuthPayload>(token);
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
