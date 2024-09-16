/* eslint-disable react-refresh/only-export-components */
import { Breakpoint, useTheme } from "@mui/material";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DashboardConfigMeta,
  DashboardPositions,
  DashboardUpdate,
} from "../api";
import { useCurrentBreakpoint } from "../utils";
import { useCurrentLayout } from "./current-layout";
import { DashboardLayout, DashboardLayouts } from "./DashboardGrid";
import { buildCatalogLayout, DashboardCatalog } from "./DashboardItem";

interface DashboardContextType {
  config?: DashboardConfig;
  layouts?: DashboardLayouts;
  currentBreakpoint?: Breakpoint;
  currentLayout?: DashboardLayout[];
  catalog: DashboardCatalog;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  setConfig: (config: DashboardConfig) => void;
  saveConfig: (update: DashboardUpdate) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export interface DashboardConfig {
  meta: DashboardConfigMeta;
  positions: DashboardPositions;
}

export interface DashboardProviderProps {
  data?: DashboardConfig;
  updateData?: (data: DashboardUpdate) => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  catalog: DashboardCatalog;
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  data,
  updateData,
  isLoading,
  isError,
  error,
  children,
  catalog,
}) => {
  const [config, setConfig] = useState<DashboardConfig | undefined>(data);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setConfig(data);
  }, [data]);

  const saveConfig = useCallback(
    async (update: DashboardUpdate) => {
      if (updateData) {
        updateData(update);
      } else if (config) {
        setConfig({
          ...config,
          ...update,
        });
      }
    },
    [config, updateData]
  );

  const {
    breakpoints: { keys: breakpoints },
  } = useTheme();

  const layouts: DashboardLayouts = useMemo(
    () =>
      breakpoints.reduce((acc, breakpoint) => {
        return {
          ...acc,
          [breakpoint]: config?.positions[breakpoint]
            ? config.positions[breakpoint].map<DashboardLayout>((position) => ({
                ...catalog[position.i].defaultLayout[breakpoint],
                ...position,
              }))
            : buildCatalogLayout(catalog, breakpoint),
        };
      }, {} as DashboardLayouts),
    [breakpoints, catalog, config]
  );

  const currentBreakpoint = useCurrentBreakpoint();
  const currentLayout = useCurrentLayout(layouts);

  return (
    <DashboardContext.Provider
      value={{
        config,
        layouts,
        currentBreakpoint,
        currentLayout,
        catalog,
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
