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
import { TicketLeaderboard } from "./TicketLeaderboard";
import { getCurrentMonthRange, useDrain } from "../utils";
import { TicketPieChart } from "./TicketPieChart";
import { DashboardGrid, DashboardCard } from "../dashboard";

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
                { i: "a", x: 0, y: 0, w: 4, h: 11 },
                {
                  i: "b",
                  x: 4,
                  y: 0,
                  w: 4,
                  h: 5,
                },
              ],
            }}
          >
            <DashboardCard key="a" title="Leaderboard" variant="outlined">
              <TicketLeaderboard tickets={tickets} />
            </DashboardCard>
            <DashboardCard key="b" title="Volume">
              <TicketPieChart tickets={tickets} />
            </DashboardCard>
          </DashboardGrid>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
