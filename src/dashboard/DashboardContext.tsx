/* eslint-disable react-refresh/only-export-components */
import { Breakpoint, useTheme } from '@mui/material';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DashboardConfigMeta,
  DashboardPositions,
  DashboardUpdate,
} from '../api';
import { useCurrentBreakpoint } from '../utils';
import { useCurrentLayout } from './current-layout';
import { DashboardLayout, DashboardLayouts } from './DashboardGrid';
import { buildCatalogLayout, DashboardCatalog } from './DashboardItem';
import { extractDashboardLayoutPositions } from './debug';

interface DashboardContextType {
  config?: DashboardConfig;
  layouts?: DashboardLayouts;
  currentBreakpoint?: Breakpoint;
  currentLayout?: DashboardLayout[];
  catalog: DashboardCatalog;
  version?: number;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  setConfig: (config: DashboardConfig) => void;
  saveConfig: (update: DashboardUpdate) => Promise<void>;
  resetConfig: () => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export interface DashboardConfig {
  version: number;
  meta: DashboardConfigMeta;
  positions: DashboardPositions;
}

export interface DashboardProviderProps {
  data?: DashboardConfig;
  updateData?: (data: DashboardUpdate) => Promise<void>;
  deleteData?: () => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  catalog: DashboardCatalog;
  version?: number;
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  data,
  updateData,
  deleteData,
  isLoading,
  isError,
  error,
  children,
  catalog,
  version,
}) => {
  const [config, setConfig] = useState<DashboardConfig | undefined>(data);
  const [initalConfig, setInitialConfig] = useState<
    DashboardConfig | undefined
  >(data);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setConfig(data);
    if (!initalConfig) {
      setInitialConfig(data);
    }
  }, [data, initalConfig]);

  const saveConfig = useCallback(
    async (update: DashboardUpdate) => {
      if (import.meta.env.MODE === 'development') {
        // this is to help us visually build the layout.
        // the output can be copy pasted back into the catalog.
        console.log(JSON.stringify(extractDashboardLayoutPositions(update)));
      }
      if (updateData) {
        updateData(update);
      } else if (config) {
        setConfig({
          ...config,
          ...update,
        });
      }
    },
    [config, updateData],
  );

  const resetConfig = useCallback(() => {
    if (deleteData) {
      deleteData();
    } else {
      setConfig(initalConfig);
    }
  }, [deleteData, initalConfig]);

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
                ...catalog[position.i]?.defaultLayout[breakpoint],
                ...position,
              }))
            : buildCatalogLayout(catalog, breakpoint),
        };
      }, {} as DashboardLayouts),
    [breakpoints, catalog, config],
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
        version,
        isLoading,
        isError,
        error,
        setConfig,
        saveConfig,
        resetConfig,
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
    throw new Error('useDashboard must be used within a DashboardProvider');
  }

  return context;
};
