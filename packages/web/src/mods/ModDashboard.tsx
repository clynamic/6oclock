import {
  Alert,
  Button,
  Fade,
  LinearProgress,
  Snackbar,
  Stack,
} from "@mui/material";
import { useMemo, useState } from "react";

import { useCachedTickets } from "../cache";
import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { DashboardCard, DashboardGrid, DashboardLayouts } from "../dashboard";
import { useCurrentBreakpoint } from "../utils";
import { defaultModDashboardLayouts, modDashboardCatalog } from "./catalog";

export const ModDashboard: React.FC = () => {
  const [layouts, setLayouts] = useState<DashboardLayouts>(
    defaultModDashboardLayouts
  );
  const currentBreakpoint = useCurrentBreakpoint();
  const currentLayout = useMemo(
    () =>
      currentBreakpoint
        ? (layouts[currentBreakpoint] ?? defaultModDashboardLayouts.lg)
        : defaultModDashboardLayouts.lg,
    [currentBreakpoint, layouts]
  );

  const { data: tickets, isFetching, isError, refetch } = useCachedTickets();

  return (
    <Page>
      <WindowTitle subtitle="Mods" />
      <PageHeader />
      <PageBody>
        <Stack sx={{ width: "100%", height: "100%" }}>
          <Fade in={isFetching}>
            <LinearProgress
              sx={{
                borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                borderTopRightRadius: (theme) => theme.shape.borderRadius,
              }}
            />
          </Fade>
          <Snackbar open={isError}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Failed to load tickets
            </Alert>
          </Snackbar>
          <DashboardGrid
            compactType={"vertical"}
            layouts={layouts}
            onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)}
          >
            {currentLayout.map((layout) => {
              const cardProps = modDashboardCatalog[layout.i];
              if (!cardProps) return null;
              return (
                <DashboardCard key={layout.i} {...cardProps}>
                  {cardProps.component({ tickets })}
                </DashboardCard>
              );
            })}
          </DashboardGrid>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
