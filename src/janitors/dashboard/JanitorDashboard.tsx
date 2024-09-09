import { Stack } from "@mui/material";

import { DashboardConfigType } from "../../api";
import {
  DashboardBody,
  DashboardEditHeader,
  DashboardProvider,
} from "../../dashboard";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { janitorDashboardCatalog } from "./catalog";

const JanitorDashboardHeader = () => {
  return <PageHeader actions={[<DashboardEditHeader />]} />;
};

export const JanitorDashboard: React.FC = () => {
  return (
    <DashboardProvider
      type={DashboardConfigType.janitor}
      catalog={janitorDashboardCatalog}
    >
      <Page>
        <PageTitle subtitle="Janitors" />
        <JanitorDashboardHeader />
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
