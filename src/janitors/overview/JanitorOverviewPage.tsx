import { Stack } from '@mui/material';

import { DashboardConfigType, UserArea } from '../../api';
import {
  DashboardBody,
  DashboardEditHeader,
  RemoteDashboardProvider,
} from '../../dashboard';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../../page';
import { ChartParamsProvider, useChartParamsValue } from '../../utils';
import {
  janitorDashboardCatalog,
  janitorDashboardCatalogVersion,
} from './JanitorCatalog';

export const JanitorOverviewPage: React.FC = () => {
  const chartParams = useChartParamsValue();

  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.janitor}
      catalog={janitorDashboardCatalog}
      version={janitorDashboardCatalogVersion}
    >
      <ChartParamsProvider params={{ ...chartParams, area: UserArea.janitor }}>
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
      </ChartParamsProvider>
    </RemoteDashboardProvider>
  );
};
