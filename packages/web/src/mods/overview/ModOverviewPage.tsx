import { DashboardConfigType, UserArea } from '../../api';
import { DashboardBody, RemoteDashboardProvider } from '../../dashboard';
import { DashboardEditHeader } from '../../dashboard/DashboardEditHeader';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../../page';
import { ChartParamsExtraProvider } from '../../utils';
import { modDashboardCatalog, modDashoardCatalogVersion } from './ModCatalog';

export const ModOverviewPage: React.FC = () => {
  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
      version={modDashoardCatalogVersion}
    >
      <ChartParamsExtraProvider params={{ area: UserArea.moderator }}>
        <Page>
          <PageTitle subtitle="Mods" />
          <PageHeader actions={[<DashboardEditHeader />]} />
          <PageBody>
            <DashboardBody />
          </PageBody>
          <PageFooter />
        </Page>
      </ChartParamsExtraProvider>
    </RemoteDashboardProvider>
  );
};
