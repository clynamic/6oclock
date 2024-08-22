import {
  Alert,
  Button,
  Fade,
  LinearProgress,
  Snackbar,
  Stack,
} from "@mui/material";
import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { useCurrentBreakpoint } from "../utils";
import { DashboardCard, DashboardGrid, DashboardLayouts } from "../dashboard";
import {
  defaultJanitorDashboardLayouts,
  janitorDashboardCatalog,
} from "./catalog";
import { useState, useMemo } from "react";
import { defaultModDashboardLayouts } from "../mods/catalog";
import { useCachedApprovals } from "../cache";

export const JanitorDashboard: React.FC = () => {
  const [layouts, setLayouts] = useState<DashboardLayouts>(
    defaultModDashboardLayouts
  );
  const currentBreakpoint = useCurrentBreakpoint();
  const currentLayout = useMemo(
    () =>
      currentBreakpoint
        ? (layouts[currentBreakpoint] ?? defaultJanitorDashboardLayouts.lg)
        : defaultModDashboardLayouts.lg,
    [currentBreakpoint, layouts]
  );

  const {
    data: approvals,
    isFetching,
    isError,
    refetch,
  } = useCachedApprovals();

  return (
    <Page>
      <WindowTitle subtitle="Janitors" />
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
            onLayoutChange={(_, newLayouts) => setLayouts(newLayouts)}
          >
            {currentLayout.map((layout) => {
              const { component: Component, ...item } =
                janitorDashboardCatalog[layout.i];
              return (
                <DashboardCard key={layout.i} {...item}>
                  <Component approvals={approvals} />
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
