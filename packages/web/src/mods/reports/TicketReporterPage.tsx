import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { useReporterSummaryInfinite } from "../../api";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { useChartDateRange } from "../../utils";
import { TicketReporterFrame } from "./TicketReporterFrame";

export const TicketReporterPage: React.FC = () => {
  const range = useChartDateRange();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReporterSummaryInfinite(
      {
        ...range,
      },
      {
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
      }
    );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Page>
      <PageTitle subtitle="Reporters" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: "100%", maxWidth: 600, margin: "auto", p: 2 }}>
          <Stack sx={{ height: "100%", width: "100%", gap: 1 }}>
            {data?.pages
              .flat()
              .map((item, i) => <TicketReporterFrame key={i} summary={item} />)}
          </Stack>
          <div ref={ref} style={{ height: 1 }} />
          {isFetchingNextPage && (
            <Stack direction={"column"} alignItems={"center"} spacing={1}>
              <CircularProgress />
              <Typography>Loading more...</Typography>
            </Stack>
          )}
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
