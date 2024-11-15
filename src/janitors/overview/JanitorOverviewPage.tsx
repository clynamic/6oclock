import { Stack } from '@mui/material';

import { DashboardConfigType } from '../../api';
import {
  DashboardBody,
  DashboardEditHeader,
  RemoteDashboardProvider,
} from '../../dashboard';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../../page';
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
    </RemoteDashboardProvider>
  );
};
