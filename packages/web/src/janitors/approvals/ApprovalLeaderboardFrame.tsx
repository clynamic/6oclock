import { Beenhere, CalendarMonth } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import { JanitorSummary } from "../../api";
import { RankingText } from "../../common/RankingText";

export interface ApprovalLeaderboardFrame {
  position: number;
  summary?: JanitorSummary;
}

export const ApprovalLeaderboardFrame: React.FC<ApprovalLeaderboardFrame> = ({
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
            <Stack direction="row" spacing={1}>
              {summary ? (
                <>
                  <Chip
                    size="small"
                    avatar={<Beenhere />}
                    label={`${summary.total} approvals`}
                  />
                  <Chip
                    size="small"
                    avatar={<CalendarMonth />}
                    label={`${summary.days} days`}
                  />
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
