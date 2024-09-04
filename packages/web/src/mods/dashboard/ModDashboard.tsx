import { Stack } from "@mui/material";

import { DashboardConfigType } from "../../api";
import { DashboardProvider } from "../../dashboard";
import { Page, PageBody, PageFooter, WindowTitle } from "../../page";
import { modDashboardCatalog } from "./catalog";
import { ModDashboardBody } from "./ModDashboardBody";
import { ModDashboardHeader } from "./ModDashboardHeader";

export const ModDashboardPage: React.FC = () => {
  return (
    <DashboardProvider
      type={DashboardConfigType.moderator}
      catalog={modDashboardCatalog}
    >
      <Page>
        <WindowTitle subtitle="Mods" />
        <ModDashboardHeader />
        <PageBody>
          <Stack sx={{ height: "100%", width: "100%" }}>
            <ModDashboardBody />
          </Stack>
        </PageBody>
        <PageFooter />
      </Page>
    </DashboardProvider>
  );
};
