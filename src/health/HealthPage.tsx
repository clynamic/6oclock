import { DashboardBody } from '../dashboard/DashboardBody';
import { DashboardProvider } from '../dashboard/DashboardContext';
import { DashboardEditHeader } from '../dashboard/DashboardEditHeader';
import { buildCatalogLayouts } from '../dashboard/DashboardItem';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { PageHeader } from '../page/header/PageHeader';
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
