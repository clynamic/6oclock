import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useUserHead } from "../api";
import {
  buildCatalogLayouts,
  DashboardBody,
  DashboardCatalog,
  DashboardProvider,
} from "../dashboard";
import { modProfileCatalog } from "../mods";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../page";
import { ChartParamsProvider, useChartParamsValue } from "../utils";

export const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const {
    data: user,
    isLoading,
    isError,
  } = useUserHead(Number(id), {
    query: {
      enabled: id !== undefined,
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
      <PageHeader />
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
