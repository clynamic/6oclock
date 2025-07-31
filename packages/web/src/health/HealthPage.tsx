import { PageBody } from '../page/PageBody';
import { PageTitle } from '../page/PageTitle';
import { PageFooter } from '../page/PageFooter';
import { Page } from '../page/Page';
import { PageHeader } from '../page/header/PageHeader';
import { healthCatalog } from './catalog';
import { DashboardBody } from '../dashboard/DashboardBody';
import { DashboardProvider } from '../dashboard/DashboardContext';
import { DashboardEditHeader } from '../dashboard/DashboardEditHeader';
import { buildCatalogLayouts } from '../dashboard/DashboardItem';

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
