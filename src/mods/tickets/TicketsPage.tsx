import { Box, Stack } from "@mui/material";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { useTicketerSummaryInfinite } from "../../api";
import {
  Page,
  PageBody,
  PageFooter,
  PageHeader,
  WindowTitle,
} from "../../page";
import { TicketLeaderboardFrame } from "./TicketLeaderboardFrame";

export const TicketerPage: React.FC = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTicketerSummaryInfinite(undefined, {
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

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Page>
      <WindowTitle subtitle="Ticketers" />
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
          <div ref={ref} style={{ height: 1 }} />
          {isFetchingNextPage && <div>Loading more...</div>}
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
