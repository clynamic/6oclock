import { Stack } from '@mui/material';

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
import {
  janitorDashboardCatalog,
  janitorDashboardCatalogVersion,
} from './JanitorCatalog';

export const JanitorOverviewPage: React.FC = () => {
  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.janitor}
      catalog={janitorDashboardCatalog}
      version={janitorDashboardCatalogVersion}
    >
      <ChartParamsExtraProvider params={{ area: UserArea.janitor }}>
        <Page>
          <PageTitle subtitle="Janitors" />
          <PageHeader actions={[<DashboardEditHeader />]} />
          <PageBody>
            <Stack sx={{ height: '100%', width: '100%' }}>
              <DashboardBody />
            </Stack>
          </PageBody>
          <PageFooter />
        </Page>
      </ChartParamsExtraProvider>
    </RemoteDashboardProvider>
  );
};
