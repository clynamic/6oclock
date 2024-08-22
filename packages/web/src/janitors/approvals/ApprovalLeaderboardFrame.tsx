import { Post, User } from "../../api";
import { ApprovalContributions } from "./approvals";
import { CalendarMonth, Beenhere } from "@mui/icons-material";
import {
  Card,
  Box,
  Stack,
  Avatar,
  Skeleton,
  Typography,
  Chip,
} from "@mui/material";
import { useMemo } from "react";
import { RankingText } from "../../common/RankingText";

export interface ApprovalLeaderboardFrame {
  contribution: ApprovalContributions;
  user?: User;
  avatar?: Post;
}

export const ApprovalLeaderboardFrame: React.FC<ApprovalLeaderboardFrame> = ({
  contribution,
  user,
  avatar,
}) => {
  const dayCount = useMemo(
    () =>
      Array.from(new Set(contribution.dates.map((date) => date.toDateString())))
        .length,
    [contribution.dates]
  );

  return (
    <Card>
      <Box p={2}>
        <Stack direction="row" spacing={2}>
          {user ? (
            <Avatar
              variant="rounded"
              alt={`avatar of ${contribution.user}`}
              src={avatar?.sample.url}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "background.paper",
                color: "text.primary",
              }}
            >
              {user?.name.split("_").map((part) => part[0])}
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
                {user ? user?.name : <Skeleton width={120} />}
              </Typography>
              <RankingText rank={contribution.position}>
                #{contribution.position}
              </RankingText>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                avatar={<Beenhere />}
                label={`${contribution.count} approvals`}
              />
              <Chip
                size="small"
                avatar={<CalendarMonth />}
                label={`${dayCount} days`}
              />
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
