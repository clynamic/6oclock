import {
  buildCatalogLayouts,
  DashboardBody,
  DashboardEditHeader,
  DashboardProvider,
} from '../dashboard';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';
import { healthCatalog } from './catalog';

export const HealthPage: React.FC = () => {
  return (
    <DashboardProvider
      catalog={healthCatalog}
      data={{
        version: 1,
        positions: buildCatalogLayouts(healthCatalog),
        meta: {},
      }}
    >
      <Page>
        <PageTitle subtitle="Health" />
        <PageHeader
          actions={[
            (import.meta.env.MODE === 'development' && [
              <DashboardEditHeader key="edit-dashboard" />,
            ]) ||
              [],
          ]}
        />
        <PageBody>
          <DashboardBody />
        </PageBody>
        <PageFooter />
      </Page>
    </DashboardProvider>
  );
};
