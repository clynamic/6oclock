import { Beenhere, Shield } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../page";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <WindowTitle subtitle="Home" />
      <PageHeader />
      <PageBody>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={{
            xs: 2,
            sm: 6,
          }}
        >
          <Button
            sx={{
              width: "200px",
              height: "200px",
              maxWidth: "100%",
              maxHeight: "100%",
              border: (theme) => `2px solid ${theme.palette.secondary.main}`,
              boxShadow: (theme) => theme.shadows[6],
            }}
            variant="text"
            color="secondary"
            onClick={() => {
              navigate("/mods");
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Shield sx={{ fontSize: 32 }} />
              <Typography variant="h5">Mods</Typography>
            </Stack>
          </Button>
          <Button
            sx={{
              width: "200px",
              height: "200px",
              maxWidth: "100%",
              maxHeight: "100%",
              border: (theme) => `2px solid ${theme.palette.secondary.main}`,
              boxShadow: (theme) => theme.shadows[6],
            }}
            variant="text"
            color="secondary"
            onClick={() => {
              navigate("/janitors");
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Beenhere sx={{ fontSize: 32 }} />
              <Typography variant="h5">Janitors</Typography>
            </Stack>
          </Button>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
