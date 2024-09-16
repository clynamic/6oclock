import { Stack } from "@mui/material";

import { DashboardConfigType } from "../../api";
import { DashboardBody, RemoteDashboardProvider } from "../../dashboard";
import { DashboardEditHeader } from "../../dashboard/DashboardEditHeader";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { modDashboardCatalog } from "./ModCatalog";

export const ModOverviewPage: React.FC = () => {
  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
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
