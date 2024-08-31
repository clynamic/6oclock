import { CalendarMonth, Sell } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import { ModSummary } from "../../api";
import { RankingText } from "../../common/RankingText";

export interface TicketLeaderboardFrameProps {
  position: number;
  summary?: ModSummary;
}

export const TicketLeaderboardFrame: React.FC<TicketLeaderboardFrameProps> = ({
  position,
  summary,
}) => {
  return (
    <Card>
      <Box p={2}>
        <Stack direction="row" spacing={2}>
          {summary?.head ? (
            <Avatar
              variant="rounded"
              alt={`avatar of ${summary.head.name}`}
              src={summary.head.avatar}
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
              <Typography variant="h6">
                {summary ? (
                  (summary.head?.name ?? `User #${summary.userId}`)
                ) : (
                  <Skeleton width={120} />
                )}
              </Typography>
              <RankingText rank={position}>#{position}</RankingText>
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
                    label={`${summary.claimed} tickets`}
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
