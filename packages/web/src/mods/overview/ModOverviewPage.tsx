import { DashboardConfigType, UserArea } from '../../api';
import { DashboardBody } from '../../dashboard/DashboardBody';
import { DashboardEditHeader } from '../../dashboard/DashboardEditHeader';
import { RemoteDashboardProvider } from '../../dashboard/RemoteDashboardContext';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { ChartParamsExtraProvider } from '../../utils/charts';
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
