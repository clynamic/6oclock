import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserHead } from '../api';
import {
  buildCatalogLayouts,
  DashboardBody,
  DashboardCatalog,
  DashboardProvider,
} from '../dashboard';
import { modProfileCatalog } from '../mods';
import { Page, PageBody, PageFooter, PageTitle } from '../page';
import { ChartParamsProvider, useChartParamsValue } from '../utils';
import { ProfilePageHeader } from './ProfilePageHeader';

export const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const userId = useMemo(() => (id ? Number(id) : undefined), [id]);
  const {
    data: user,
    isLoading,
    isError,
  } = useUserHead(userId ?? 0, {
    query: {
      enabled: !!userId,
    },
  });
  const chartParams = useChartParamsValue();

  const catalog = useMemo<DashboardCatalog | undefined>(() => {
    if (!user) return undefined;
    return modProfileCatalog;
  }, [user]);

  return (
    <Page>
      <PageTitle subtitle={user?.name ?? `User #${id}`} />
      <ProfilePageHeader userId={userId} />
      <PageBody>
        <ChartParamsProvider params={{ ...chartParams, userId: Number(id) }}>
          <DashboardProvider
            catalog={catalog || {}}
            isLoading={isLoading}
            isError={isError}
            data={
              catalog
                ? {
                    positions: buildCatalogLayouts(catalog),
                    meta: {},
                  }
                : undefined
            }
          >
            <DashboardBody />
          </DashboardProvider>
        </ChartParamsProvider>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
