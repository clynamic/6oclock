import { Stack } from "@mui/material";

import { DashboardConfigType } from "../../api";
import { DashboardBody, DashboardProvider } from "../../dashboard";
import { DashboardEditHeader } from "../../dashboard/DashboardEditHeader";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { modDashboardCatalog } from "./catalog";

const ModDashboardHeader = () => {
  return <PageHeader actions={[<DashboardEditHeader />]} />;
};

export const ModDashboardPage: React.FC = () => {
  return (
    <DashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
    >
      <Page>
        <PageTitle subtitle="Mods" />
        <ModDashboardHeader />
        <PageBody>
          <Stack sx={{ height: "100%", width: "100%" }}>
            <DashboardBody />
          </Stack>
        </PageBody>
        <PageFooter />
      </Page>
    </DashboardProvider>
  );
};
