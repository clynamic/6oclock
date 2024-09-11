import { CalendarMonth, Sell } from "@mui/icons-material";
import { Avatar, Box, Card, Chip, Skeleton, Stack } from "@mui/material";

import { TicketerSummary } from "../../api";
import { UsernameText } from "../../common";
import { RankingText } from "../../common/RankingText";

export interface TicketLeaderboardFrameProps {
  summary?: TicketerSummary;
}

export const TicketLeaderboardFrame: React.FC<TicketLeaderboardFrameProps> = ({
  summary,
}) => {
  return (
    <Card>
      <Box p={2}>
        <Stack direction="row" spacing={2}>
          {summary ? (
            <Avatar
              variant="rounded"
              alt={`avatar of ${summary.head?.name ?? `User #${summary.userId}`}`}
              src={summary.head?.avatar}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "background.paper",
                color: "text.primary",
              }}
            >
              {summary.head?.name.split("_").map((part) => part[0]) ?? "?"}
            </Avatar>
          ) : (
            <Skeleton variant="rounded" width={64} height={64} />
          )}
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <UsernameText user={summary?.head} />
              {summary && (
                <RankingText rank={summary.position}>
                  #{summary.position}
                </RankingText>
              )}
            </Stack>
            <Stack
              direction="row"
              gap={1}
              sx={{ flexWrap: "wrap", maxWidth: 300 }}
            >
              {summary ? (
                <>
                  <Chip
                    size="small"
                    avatar={<Sell />}
                    label={`${summary.total} tickets`}
                  />
                  {summary.days > 1 && (
                    <Chip
                      size="small"
                      avatar={<CalendarMonth />}
                      label={`${summary.days} days`}
                    />
                  )}
                  {/* TODO: actually calculate trends with previous month's data */}
                  {/* <Chip size="small" label={<TrendingUp />} /> */}
                </>
              ) : (
                <Skeleton width={100} />
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
