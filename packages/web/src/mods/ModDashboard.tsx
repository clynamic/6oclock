import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { LinearProgress, Stack, Typography } from "@mui/material";
import { Ticket, useTicketsInfinite } from "../api";
import { TicketLeaderboard } from "./TicketLeaderboard";
import { useDrain } from "../utils";

const getCurrentMonthRange = (): string => {
  const currentDate = new Date();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return `${formatDate(firstDay)}..${formatDate(lastDay)}`;
};

export const ModDashboard = () => {
  const {
    data: tickets,
    isLoading,
    isError,
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
      <WindowTitle subtitle="Tickets Dashboard" />
      <PageHeader />
      <PageBody>
        <Stack sx={{ width: "100%", height: "100%" }} spacing={2}>
          {isLoading && <LinearProgress />}
          <Stack>
            {isError && <Typography>Error loading tickets</Typography>}
            <TicketLeaderboard tickets={tickets} />
          </Stack>
        </Stack>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
