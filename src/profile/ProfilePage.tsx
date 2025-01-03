import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { adminProfileCatalog } from '../admins';
import { UserArea, useUserHead } from '../api';
import {
  buildCatalogLayouts,
  DashboardBody,
  DashboardCatalog,
  DashboardProvider,
} from '../dashboard';
import { janitorProfileCatalog } from '../janitors';
import { modProfileCatalog } from '../mods';
import { Page, PageBody, PageFooter, PageTitle } from '../page';
import { userProfileCatalog } from '../users';
import { ChartParamsExtraProvider } from '../utils';
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

  const area = useMemo(() => {
    if (!user) return undefined;

    switch (user.level.toLowerCase()) {
      case 'janitor':
        return UserArea.janitor;
      case 'moderator':
        return UserArea.moderator;
      case 'admin':
        return UserArea.admin;
      default:
        return UserArea.member;
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
      <ChartParamsExtraProvider params={{ userId: Number(id), area }}>
        <Page>
          <PageTitle subtitle={user?.name ?? `User #${id}`} />
          <ProfilePageHeader userId={userId} />
          <PageBody>
            <DashboardBody />
          </PageBody>
          <PageFooter />
        </Page>
      </ChartParamsExtraProvider>
    </DashboardProvider>
  );
};
