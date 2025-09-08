import { useMemo } from 'react';

import { useParams } from 'react-router-dom';

import { UserArea, useUserHead } from '../api';
import { DashboardBody } from '../dashboard/DashboardBody';
import { DashboardProvider } from '../dashboard/DashboardContext';
import {
  DashboardCatalog,
  buildCatalogLayouts,
} from '../dashboard/DashboardItem';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { ChartParamsExtraProvider } from '../utils/charts';
import { profileCatalog } from './ProfileCatalog';
import { ProfilePageHeader } from './ProfilePageHeader';
import { useProfileCharts } from './useProfileChartVisibility';

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

  const { chartIds } = useProfileCharts({
    id: userId ?? 0,
    ...user,
  });

  const catalog = useMemo<DashboardCatalog>(
    () =>
      chartIds
        .filter((chartId) => profileCatalog[chartId])
        .reduce<DashboardCatalog>((acc, chartId) => {
          acc[chartId] = profileCatalog[chartId];
          return acc;
        }, {}),
    [chartIds],
  );

  return (
    <DashboardProvider
      catalog={catalog}
      isLoading={isLoading}
      isError={isError}
      data={{
        version: 1,
        positions: buildCatalogLayouts(catalog),
        meta: {},
      }}
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
