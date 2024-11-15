import { DashboardConfigType } from '../../api';
import { DashboardBody, RemoteDashboardProvider } from '../../dashboard';
import { DashboardEditHeader } from '../../dashboard/DashboardEditHeader';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../../page';
import { modDashboardCatalog, modDashoardCatalogVersion } from './ModCatalog';

export const ModOverviewPage: React.FC = () => {
  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
      version={modDashoardCatalogVersion}
    >
      <Page>
        <PageTitle subtitle="Mods" />
        <PageHeader actions={[<DashboardEditHeader />]} />
        <PageBody>
          <DashboardBody />
        </PageBody>
        <PageFooter />
      </Page>
    </RemoteDashboardProvider>
  );
};
