import { Box, Stack } from "@mui/material";

import { useApproverSummaryInfinite } from "../../api";
import { LoadMoreHint } from "../../common";
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from "../../page";
import { ApprovalLeaderboardFrame } from "./ApprovalLeaderboardFrame";

export const ApproverPage: React.FC = () => {
  const { data, ...query } = useApproverSummaryInfinite(undefined, {
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
      <PageTitle subtitle="Approvers" />
      <PageHeader />
      <PageBody>
        <Box sx={{ width: "100%", maxWidth: 600, margin: "auto", p: 2 }}>
          <Stack sx={{ height: "100%", width: "100%", gap: 1 }}>
            {data?.pages
              .flat()
              .map((item, i) => (
                <ApprovalLeaderboardFrame key={i} summary={item} />
              ))}
          </Stack>
          <LoadMoreHint query={query} />
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
