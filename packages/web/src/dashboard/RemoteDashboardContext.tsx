import { useCallback, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  DashboardConfigType,
  DashboardUpdate,
  getDashboardQueryKey,
  useCheckManifestAvailability,
  useDeleteDashboard,
  useDashboard as useRemoteDashboard,
  useUpdateDashboard,
} from '../api';
import { useChartRange } from '../utils/charts';
import { refetchQueryOptions } from '../utils/query';
import { DashboardConfig, DashboardProvider } from './DashboardContext';
import { DashboardCatalog, buildCatalogLayouts } from './DashboardItem';

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
  const { mutateAsync: updateDashboard } = useUpdateDashboard();
  const { mutateAsync: deleteDashboard } = useDeleteDashboard();
  const queryClient = useQueryClient();
  const range = useChartRange();

  const saveConfig = useCallback(
    async (update: DashboardUpdate) => {
      await updateDashboard({
        type,
        data: update,
      });
      await refetch();
    },
    [updateDashboard, refetch, type],
  );

  const deleteData = useCallback(async () => {
    await deleteDashboard({
      type,
    });
    await refetch();
  }, [deleteDashboard, refetch, type]);

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

  const itemTypes = useMemo(() => {
    return Object.values(catalog)
      .flatMap((config) => config.items ?? [])
      .filter((item, index, arr) => arr.findIndex((i) => i === item) === index);
  }, [catalog]);
  const { data: available } = useCheckManifestAvailability(
    {
      ...range,
      type: itemTypes,
    },
    refetchQueryOptions({
      enabled: itemTypes.length > 0,
    }),
  );

  return (
    <DashboardProvider
      data={data}
      updateData={saveConfig}
      deleteData={deleteData}
      isLoading={isLoading}
      isError={!!error}
      error={error}
      available={available}
      catalog={catalog}
      version={version}
    >
      {children}
    </DashboardProvider>
  );
};
