import { CalendarMonth, TrendingUp, Sell } from "@mui/icons-material";
import {
  Card,
  Box,
  Stack,
  Avatar,
  Skeleton,
  Typography,
  Chip,
} from "@mui/material";
import { User, Post } from "../api";
import { RankingText } from "./RankingText";
import { useMemo } from "react";

export interface ContributionFrameProps {
  position: number;
  contribution: TicketContribution;
  user?: User;
  avatar?: Post;
}

export interface TicketContribution {
  user: number;
  count: number;
  dates: Date[];
}

export const ContributionFrame: React.FC<ContributionFrameProps> = ({
  contribution,
  position,
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
              <RankingText rank={position}>#{position}</RankingText>
            </Stack>
            <Stack
              direction="row"
              gap={1}
              sx={{ flexWrap: "wrap", maxWidth: 300 }}
            >
              <Chip
                size="small"
                avatar={<Sell />}
                label={`${contribution.count} tickets`}
              />
              {dayCount > 1 && (
                <Chip
                  size="small"
                  avatar={<CalendarMonth />}
                  label={`${dayCount} days`}
                />
              )}
              <Chip size="small" label={<TrendingUp />} />
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
