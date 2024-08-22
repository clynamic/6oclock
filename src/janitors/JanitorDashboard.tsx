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
import { useCachedApprovals, useCachedUploads } from "../cache";

export const JanitorDashboard: React.FC = () => {
  const [layouts, setLayouts] = useState<DashboardLayouts>(
    defaultJanitorDashboardLayouts
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
    isFetching: isFetchingApprovals,
    isError: approvalsError,
    refetch: refetchApprovals,
  } = useCachedApprovals();

  const {
    data: uploads,
    isFetching: isFetchingUploads,
    isError: uploadsError,
    refetch: refetchUploads,
  } = useCachedUploads();

  const isFetching = useMemo(
    () => isFetchingApprovals || isFetchingUploads,
    [isFetchingApprovals, isFetchingUploads]
  );

  const isError = useMemo(
    () => approvalsError || uploadsError,
    [approvalsError, uploadsError]
  );

  const errorMessage = useMemo(() => {
    if (!isError) return null;
    const errors = [];
    if (approvalsError) errors.push("approvals");
    if (uploadsError) errors.push("uploads");
    return "Failed to load " + errors.join(" and ");
  }, [approvalsError, uploadsError, isError]);

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
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    if (approvalsError) refetchApprovals();
                    if (uploadsError) refetchUploads();
                  }}
                >
                  Retry
                </Button>
              }
            >
              {errorMessage}
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
                  <Component approvals={approvals} uploads={uploads} />
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
