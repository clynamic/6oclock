import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import {
  Alert,
  Button,
  Fade,
  LinearProgress,
  Snackbar,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Ticket, useTicketsInfinite } from "../api";
import { getCurrentMonthRange, useDrain } from "../utils";
import { DashboardGrid, DashboardCard, DashboardLayouts } from "../dashboard";
import { useMemo, useState } from "react";
import {
  defaultModDashboardLayouts,
  modDashboardCatalog,
  ModDashboardItemConfig,
} from "./catalog";

const useCurrentBreakpoint = () => {
  const theme = useTheme();

  const breakpoints = theme.breakpoints.keys;

  const currentBreakpoint = breakpoints
    .map((breakpoint) => ({
      breakpoint,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      matches: useMediaQuery(theme.breakpoints.up(breakpoint)),
    }))
    .reverse()
    .find((item) => item.matches)?.breakpoint;

  return currentBreakpoint;
};

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

  const {
    data: tickets,
    isFetching,
    isError,
    refetch,
  } = useDrain<Ticket>(
    useTicketsInfinite(
      {
        limit: 320,
        "search[created_at]": getCurrentMonthRange(),
      },
      {
        query: {
          refetchOnMount: false,
          staleTime: 5 * 60 * 1000,
          initialPageParam: 1,
          getNextPageParam: (lastPage, _, i) => {
            if (lastPage.length === 0) return undefined;
            return (i ?? 1) + 1;
          },
        },
      }
    )
  );

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
              const cardProps: ModDashboardItemConfig =
                modDashboardCatalog[layout.i];
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
