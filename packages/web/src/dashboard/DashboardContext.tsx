/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  DashboardConfig,
  DashboardConfigType,
  DashboardUpdate,
  useDashboard as useRemoteDashboard,
  useUpdateDashboard,
} from "../api";

interface DashboardContextType {
  config?: DashboardConfig;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  setConfig: (config: DashboardConfig) => void;
  saveConfig: (update: DashboardUpdate) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export interface DashboardProviderProps {
  type: DashboardConfigType;
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  type,
}) => {
  const { data, isLoading, isError, error } = useRemoteDashboard(type);
  const { mutateAsync } = useUpdateDashboard();

  const [config, setConfig] = useState<DashboardConfig | undefined>(data);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setConfig(data);
  }, [data]);

  const saveConfig = useCallback(
    async (update: DashboardUpdate) => {
      await mutateAsync({
        type,
        data: update,
      });
    },
    [mutateAsync, type]
  );

  return (
    <DashboardContext.Provider
      value={{
        config,
        isLoading,
        isError,
        error,
        setConfig,
        saveConfig,
        isEditing,
        setIsEditing,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }

  return context;
};
