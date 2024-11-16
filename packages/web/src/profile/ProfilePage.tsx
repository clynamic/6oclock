import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { adminProfileCatalog } from '../admins';
import { useUserHead } from '../api';
import {
  buildCatalogLayouts,
  DashboardBody,
  DashboardCatalog,
  DashboardProvider,
} from '../dashboard';
import { janitorProfileCatalog } from '../janitors';
import { modProfileCatalog } from '../mods';
import { Page, PageBody, PageFooter, PageTitle } from '../page';
import { ChartParamsProvider, useChartParamsValue } from '../utils';
import { ProfilePageHeader } from './ProfilePageHeader';
import { userProfileCatalog } from './UserProfileCatalog';

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

    switch (user.level.toLowerCase()) {
      case 'janitor':
        return janitorProfileCatalog;
      case 'moderator':
        return modProfileCatalog;
      case 'admin':
        return adminProfileCatalog;
      default:
        return userProfileCatalog;
    }
  }, [user]);

  return (
    <DashboardProvider
      catalog={catalog || {}}
      isLoading={isLoading}
      isError={isError}
      data={
        catalog
          ? {
              version: 1,
              positions: buildCatalogLayouts(catalog),
              meta: {},
            }
          : undefined
      }
    >
      <ChartParamsProvider params={{ ...chartParams, userId: Number(id) }}>
        <Page>
          <PageTitle subtitle={user?.name ?? `User #${id}`} />
          <ProfilePageHeader userId={userId} />
          <PageBody>
            <DashboardBody />
          </PageBody>
          <PageFooter />
        </Page>
      </ChartParamsProvider>
    </DashboardProvider>
  );
};
