import { DashboardConfigType, UserArea } from '../../api';

import { DashboardEditHeader } from '../../dashboard/DashboardEditHeader';
import { PageHeader } from '../../page/header/PageHeader';
import { Page } from '../../page/Page';
import { PageTitle } from '../../page/PageTitle';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { ChartParamsExtraProvider } from '../../utils/charts';
import { modDashboardCatalog, modDashoardCatalogVersion } from './ModCatalog';
import { DashboardBody } from '../../dashboard/DashboardBody';
import { RemoteDashboardProvider } from '../../dashboard/RemoteDashboardContext';

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
