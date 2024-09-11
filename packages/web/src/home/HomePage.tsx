import { Beenhere, Shield } from "@mui/icons-material";
import {
  Button,
  Divider,
  Stack,
  Theme,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../page";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <PageTitle subtitle="Home" />
      <PageHeader />
      <PageBody>
        <Stack direction="column" spacing={2}>
          <Stack
            direction={{
              sm: "row",
              xs: "column",
            }}
            spacing={{
              xs: 2,
              sm: 6,
            }}
            justifyContent="center"
            alignItems="center"
          >
            <ThemeProvider<Theme>
              theme={(theme) => ({
                ...theme,
                components: {
                  MuiButton: {
                    defaultProps: {
                      variant: "text",
                      color: "secondary",
                    },
                    styleOverrides: {
                      root: {
                        width: "200px",
                        height: "200px",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        border: `2px solid ${theme.palette.secondary.main}`,
                        boxShadow: theme.shadows[6],
                      },
                    },
                  },
                },
              })}
            >
              {/*
                <Button
                  onClick={() => {
                    navigate("/admins");
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Gavel sx={{ fontSize: 32 }} />
                    <Typography variant="h5">Admins</Typography>
                  </Stack>
                </Button>
              */}
              <Button
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
                onClick={() => {
                  navigate("/janitors");
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Beenhere sx={{ fontSize: 32 }} />
                  <Typography variant="h5">Janitors</Typography>
                </Stack>
              </Button>
            </ThemeProvider>
          </Stack>
          <Divider orientation="horizontal" />
          <Typography variant="h4">{`6 o'clock`}</Typography>
          <Typography variant="body1">
            Your valiant efforts are appreciated.
          </Typography>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
