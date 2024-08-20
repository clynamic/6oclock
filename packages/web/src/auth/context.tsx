import React, { createContext, useContext, useState } from "react";
import { Credentials } from "../http";

interface AuthContextType {
  credentials: Credentials | null;
  saveCredentials: (credentials: Credentials) => void;
  clearCredentials: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCredentials must be used within a CredentialsProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    const savedCredentials = localStorage.getItem("credentials");
    return savedCredentials ? JSON.parse(savedCredentials) : null;
  });

  const saveCredentials = (newCredentials: Credentials) => {
    setCredentials(newCredentials);
    localStorage.setItem("credentials", JSON.stringify(newCredentials));
  };

  const clearCredentials = () => {
    setCredentials(null);
    localStorage.removeItem("credentials");
  };

  return (
    <AuthContext.Provider
      value={{ credentials, saveCredentials, clearCredentials }}
    >
      {children}
    </AuthContext.Provider>
  );
};
