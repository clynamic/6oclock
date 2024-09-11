import { AxiosError } from "axios";
import { useCallback, useEffect } from "react";

import {
  DashboardConfigType,
  DashboardUpdate,
  useDashboard as useRemoteDashboard,
  useUpdateDashboard,
} from "../api";
import { DashboardProvider } from "./DashboardContext";
import { buildCatalogLayouts, DashboardCatalog } from "./DashboardItem";

export interface RemoteDashboardProviderProps {
  type: DashboardConfigType;
  catalog: DashboardCatalog;
  children: React.ReactNode;
}

export const RemoteDashboardProvider: React.FC<
  RemoteDashboardProviderProps
> = ({ children, type, catalog }) => {
  const { data, isLoading, isError, error, refetch } = useRemoteDashboard(
    type,
    {
      query: {
        retry: (failureCount, error) => {
          if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
          }
          return failureCount < 3;
        },
      },
    }
  );
  const { mutateAsync } = useUpdateDashboard();

  const saveConfig = useCallback(
    async (update: DashboardUpdate) => {
      await mutateAsync({
        type,
        data: update,
      });
    },
    [mutateAsync, type]
  );

  useEffect(() => {
    if (
      error &&
      error instanceof AxiosError &&
      error.response?.status === 404
    ) {
      saveConfig({
        positions: buildCatalogLayouts(catalog),
      }).then(() => refetch());
    }
  }, [catalog, error, refetch, saveConfig]);

  return (
    <DashboardProvider
      data={data}
      updateData={saveConfig}
      isLoading={isLoading}
      isError={isError}
      error={error}
      catalog={catalog}
    >
      {children}
    </DashboardProvider>
  );
};
