import { DashboardConfigType, UserArea } from '../../api';
import { DashboardBody, RemoteDashboardProvider } from '../../dashboard';
import { DashboardEditHeader } from '../../dashboard/DashboardEditHeader';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../../page';
import { ChartParamsProvider, useChartParamsValue } from '../../utils';
import { modDashboardCatalog, modDashoardCatalogVersion } from './ModCatalog';

export const ModOverviewPage: React.FC = () => {
  const chartParams = useChartParamsValue();

  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
      version={modDashoardCatalogVersion}
    >
      <ChartParamsProvider
        params={{ ...chartParams, area: UserArea.moderator }}
      >
        <Page>
          <PageTitle subtitle="Mods" />
          <PageHeader actions={[<DashboardEditHeader />]} />
          <PageBody>
            <DashboardBody />
          </PageBody>
          <PageFooter />
        </Page>
      </ChartParamsProvider>
    </RemoteDashboardProvider>
  );
};
