import { Stack } from "@mui/material";

import { DashboardConfigType } from "../../api";
import { DashboardBody, RemoteDashboardProvider } from "../../dashboard";
import { DashboardEditHeader } from "../../dashboard/DashboardEditHeader";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { modDashboardCatalog } from "./catalog";

export const ModDashboardPage: React.FC = () => {
  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
    >
      <Page>
        <PageTitle subtitle="Mods" />
        <PageHeader actions={[<DashboardEditHeader />]} />
        <PageBody>
          <Stack sx={{ height: "100%", width: "100%" }}>
            <DashboardBody />
          </Stack>
        </PageBody>
        <PageFooter />
      </Page>
    </RemoteDashboardProvider>
  );
};
