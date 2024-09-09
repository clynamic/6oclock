import { Box, Stack } from "@mui/material";

import { useTicketerSummaryInfinite } from "../../api";
import { LoadMore } from "../../common";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { TicketLeaderboardFrame } from "./TicketLeaderboardFrame";

export const TicketerPage: React.FC = () => {
  const { data, ...query } = useTicketerSummaryInfinite(undefined, {
    query: {
      refetchInterval: 1000 * 60 * 5,
      initialPageParam: 1,
      getNextPageParam: (lastPage, _, i) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return (i ?? 1) + 1;
      },
    },
  });

  return (
    <Page>
      <PageTitle subtitle="Ticketers" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: "100%", maxWidth: 600, margin: "auto", p: 2 }}>
          <Stack sx={{ height: "100%", width: "100%", gap: 1 }}>
            {data?.pages
              .flat()
              .map((item, i) => (
                <TicketLeaderboardFrame key={i} summary={item} />
              ))}
          </Stack>
          <LoadMore query={query} />
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
