import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";

import { DashboardPosition } from "../../api";
import {
  DashboardCard,
  DashboardGrid,
  DashboardLayouts,
  useCurrentLayout,
  useDashboard,
} from "../../dashboard";
import { defaultModDashboardPositions, modDashboardCatalog } from "./catalog";

export const ModDashboardBody = () => {
  const { config, setConfig, saveConfig, isEditing, isLoading } =
    useDashboard();

  const positions = config?.positions ?? defaultModDashboardPositions;

  const layouts = useMemo(
    () =>
      Object.entries(positions ?? defaultModDashboardPositions).reduce(
        (
          layouts,
          [screenSize, screenPositions]: [string, DashboardPosition[]]
        ) => ({
          ...layouts,
          [screenSize]: screenPositions?.map((pos) => ({
            ...pos,
            ...modDashboardCatalog[pos.i]?.constraints,
            isResizable: isEditing,
            isDraggable: isEditing,
          })),
        }),
        {} as DashboardLayouts
      ),
    [isEditing, positions]
  );

  const currentLayout = useCurrentLayout(layouts);

  useEffect(() => {
    //  saveConfig({ positions: defaultModDashboardPositions, meta: {} });
  }, [saveConfig]);

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
        const { component: Component, card } = modDashboardCatalog[layout.i];
        return (
          <DashboardCard key={layout.i} {...card}>
            <Component />
          </DashboardCard>
        );
      })}
    </DashboardGrid>
  );
};
