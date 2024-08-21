import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import {
  Alert,
  Button,
  Fade,
  LinearProgress,
  Snackbar,
  Stack,
} from "@mui/material";
import { Ticket, useTicketsInfinite } from "../api";
import { getCurrentMonthRange, useDrain } from "../utils";
import { TicketStatusChart } from "./charts/TicketStatusChart";
import { DashboardGrid, DashboardCard } from "../dashboard";
import {
  TicketTypeChart,
  TicketActivityChart,
  TicketFrontlineChart,
} from "./charts";
import { TicketLeaderboard } from "./contributions";
import { TicketReporterBoard } from "./reports";

export const ModDashboard: React.FC = () => {
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
            layouts={{
              lg: [
                { i: "leaderboard", x: 0, y: 0, w: 4, h: 11 },
                {
                  i: "volume",
                  x: 4,
                  y: 0,
                  w: 4,
                  h: 5,
                },
                {
                  i: "type",
                  x: 4,
                  y: 5,
                  w: 4,
                  h: 6,
                },
                {
                  i: "activity",
                  x: 0,
                  y: 11,
                  w: 6,
                  h: 5,
                },
                {
                  i: "reporters",
                  x: 8,
                  y: 0,
                  w: 4,
                  h: 11,
                },
                {
                  i: "frontline",
                  x: 8,
                  y: 11,
                  w: 6,
                  h: 5,
                },
              ],
            }}
          >
            <DashboardCard
              key="leaderboard"
              title="Leaderboard"
              variant="outlined"
            >
              <TicketLeaderboard tickets={tickets} />
            </DashboardCard>
            <DashboardCard key="volume" title="Volume">
              <TicketStatusChart tickets={tickets} />
            </DashboardCard>
            <DashboardCard key="type" title="Type">
              <TicketTypeChart tickets={tickets} />
            </DashboardCard>
            <DashboardCard key="activity" title="Activity">
              <TicketActivityChart tickets={tickets} />
            </DashboardCard>
            <DashboardCard key="reporters" title="Reporters" variant="outlined">
              <TicketReporterBoard tickets={tickets} />
            </DashboardCard>
            <DashboardCard key="frontline" title="Frontline">
              <TicketFrontlineChart tickets={tickets} />
            </DashboardCard>
          </DashboardGrid>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
