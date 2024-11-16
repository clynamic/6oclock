import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useCallback, useMemo } from 'react';

import {
  DashboardConfigType,
  DashboardUpdate,
  getDashboardQueryKey,
  useDashboard as useRemoteDashboard,
  useUpdateDashboard,
} from '../api';
import { DashboardConfig, DashboardProvider } from './DashboardContext';
import { buildCatalogLayouts, DashboardCatalog } from './DashboardItem';

export interface RemoteDashboardProviderProps {
  type: DashboardConfigType;
  version?: number;
  catalog: DashboardCatalog;
  children: React.ReactNode;
}

export const RemoteDashboardProvider: React.FC<
  RemoteDashboardProviderProps
> = ({ children, type, catalog, version }) => {
  const {
    data: remoteData,
    isLoading,
    error: remoteError,
    refetch,
  } = useRemoteDashboard(type, {
    query: {
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
    },
  });
  const { mutateAsync } = useUpdateDashboard();
  const queryClient = useQueryClient();

  const saveConfig = useCallback(
    async (update: DashboardUpdate) => {
      await mutateAsync({
        type,
        data: update,
      });
      await refetch();
    },
    [mutateAsync, refetch, type],
  );

  const data = useMemo<DashboardConfig | undefined>(() => {
    if (
      remoteError &&
      remoteError instanceof AxiosError &&
      remoteError.response?.status === 404
    ) {
      const initial: DashboardConfig = {
        version: version ?? 1,
        positions: buildCatalogLayouts(catalog),
        meta: {},
      };
      queryClient.setQueryData(getDashboardQueryKey(type), initial);
      return initial;
    } else if (remoteData) {
      return remoteData;
    } else {
      return undefined;
    }
  }, [remoteError, remoteData, version, catalog, queryClient, type]);

  const error = useMemo(() => {
    if (
      remoteError &&
      remoteError instanceof AxiosError &&
      remoteError.response?.status === 404
    ) {
      return undefined;
    }
    return remoteError;
  }, [remoteError]);

  return (
    <DashboardProvider
      data={data}
      updateData={saveConfig}
      isLoading={isLoading}
      isError={!!error}
      error={error}
      catalog={catalog}
      version={version}
    >
      {children}
    </DashboardProvider>
  );
};
