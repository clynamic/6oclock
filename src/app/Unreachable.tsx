import { WifiTetheringOff } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../page";

export const UnreachablePage: React.FC = () => {
  return (
    <Page>
      <PageTitle subtitle="Unreachable" />
      <PageHeader />
      <PageBody>
        <Stack spacing={2} alignItems="center">
          <WifiTetheringOff sx={{ fontSize: 96 }} />
          <Typography>
            Oops! Look's like our servers are offline. Please try again later.
          </Typography>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
