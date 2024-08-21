import { Stack, Typography } from "@mui/material";
import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { Construction } from "@mui/icons-material";

export const JanitorsDashboard: React.FC = () => {
  return (
    <Page>
      <WindowTitle subtitle="Janitors" />
      <PageHeader />
      <PageBody>
        <Stack spacing={2} alignItems="center">
          <Construction fontSize="large" />
          <Typography variant="h5">Work in progress</Typography>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
