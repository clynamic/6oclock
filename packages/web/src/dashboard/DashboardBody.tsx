import { ErrorOutline, HourglassEmpty } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";

import { DashboardCard } from "./DashboardCard";
import { useDashboard } from "./DashboardContext";
import { DashboardGrid } from "./DashboardGrid";

export const DashboardBody = () => {
  const {
    config,
    layouts,
    currentLayout,
    catalog,
    setConfig,
    isLoading,
    isError,
  } = useDashboard();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Loading dashboard...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
        }}
      >
        <ErrorOutline sx={{ fontSize: 48 }} />
        <Typography variant="h6">
          An error occurred while loading your dashboard
        </Typography>
      </Box>
    );
  }

  if (currentLayout?.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
        }}
      >
        <HourglassEmpty sx={{ fontSize: 48 }} />
        <Typography variant="h6">Your dashboard is empty</Typography>
        <Typography variant="caption">
          Use the items menu to add components to your dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <DashboardGrid
      compactType={"vertical"}
      layouts={layouts}
      onLayoutChange={(_, allLayouts) => {
        if (!config) return;
        setConfig({
          ...config,
          positions: allLayouts,
        });
      }}
    >
      {currentLayout?.map((layout) => {
        const { component: Component, card } = catalog[layout.i];
        return (
          <DashboardCard key={layout.i} {...card}>
            <Component />
          </DashboardCard>
        );
      })}
    </DashboardGrid>
  );
};
