import { Construction } from "@mui/icons-material";
import { Alert, Stack } from "@mui/material";
import { useState } from "react";

import { DashboardConfigType } from "../../api";
import {
  DashboardBody,
  DashboardEditHeader,
  RemoteDashboardProvider,
} from "../../dashboard";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { janitorDashboardCatalog } from "./catalog";

const JanitorDashboardHeader = () => {
  return <PageHeader actions={[<DashboardEditHeader />]} />;
};

export const JanitorDashboard: React.FC = () => {
  const [showWarning, setShowWarning] = useState(true);

  return (
    <RemoteDashboardProvider
      type={DashboardConfigType.janitor}
      catalog={janitorDashboardCatalog}
    >
      <Page>
        <PageTitle subtitle="Janitors" />
        <JanitorDashboardHeader />
        <PageBody>
          <Stack sx={{ height: "100%", width: "100%" }}>
            <DashboardBody />
            {showWarning && (
              <Alert
                severity="warning"
                icon={<Construction />}
                sx={{ m: 2 }}
                onClose={() => setShowWarning(false)}
              >
                Something missing? We're still working on this page.
              </Alert>
            )}
          </Stack>
        </PageBody>
        <PageFooter />
      </Page>
    </RemoteDashboardProvider>
  );
};
