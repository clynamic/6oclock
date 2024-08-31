import { Stack } from "@mui/material";
import { useMemo, useState } from "react";

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

  return (
    <Page>
      <WindowTitle subtitle="Mods" />
      <PageHeader />
      <PageBody>
        <Stack sx={{ height: "100%", width: "100%" }}>
          <DashboardGrid
            compactType={"vertical"}
            layouts={layouts}
            onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)}
          >
            {currentLayout.map((layout) => {
              const { component: Component, ...item } =
                modDashboardCatalog[layout.i];
              return (
                <DashboardCard key={layout.i} {...item}>
                  <Component />
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
