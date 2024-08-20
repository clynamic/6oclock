import { Page, PageBody, PageFooter, PageHeader, WindowTitle } from "../common";
import { LinearProgress, Stack, Typography } from "@mui/material";
import { Ticket, useTicketsInfinite } from "../api";
import { TicketLeaderboard } from "./TicketLeaderboard";
import { useDrain } from "../utils";
import dayjs from "dayjs";

const getCurrentMonthRange = (): string => {
  const now = dayjs();
  const firstDay = now.startOf("month").format("YYYY-MM-DD");
  const lastDay = now.endOf("month").format("YYYY-MM-DD");

  return `${firstDay}..${lastDay}`;
};

export const ModDashboard: React.FC = () => {
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
