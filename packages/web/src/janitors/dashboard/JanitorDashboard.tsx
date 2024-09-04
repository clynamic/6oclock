import { Stack } from "@mui/material";
import { useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardGrid,
  DashboardLayouts,
} from "../../dashboard";
import {
  Page,
  PageBody,
  PageFooter,
  PageHeader,
  WindowTitle,
} from "../../page";
import { useCurrentBreakpoint } from "../../utils";
import {
  defaultJanitorDashboardLayouts,
  janitorDashboardCatalog,
} from "./catalog";

export const JanitorDashboard: React.FC = () => {
  const [layouts, setLayouts] = useState<DashboardLayouts>(
    defaultJanitorDashboardLayouts
  );
  const currentBreakpoint = useCurrentBreakpoint();
  const currentLayout = useMemo(
    () =>
      currentBreakpoint
        ? (layouts[currentBreakpoint] ?? defaultJanitorDashboardLayouts.lg)
        : defaultJanitorDashboardLayouts.lg,
    [currentBreakpoint, layouts]
  );

  return (
    <Page>
      <WindowTitle subtitle="Janitors" />
      <PageHeader />
      <PageBody>
        <Stack sx={{ height: "100%", width: "100%" }}>
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
