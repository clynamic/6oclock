import {
  Beenhere,
  CalendarMonth,
  Leaderboard,
  Sell,
  Whatshot,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Skeleton,
  Stack,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { PerformanceSummary } from '../../api';
import { TrendIcon, UserAvatar, UsernameText } from '../../common';
import { RankingText } from '../../common/RankingText';

const getPointsColor = (score: number) => {
  if (score < 0) {
    return 'error.main';
  }
  if (score < 100) {
    return 'warning.main';
  }
  return 'success.main';
};

export interface PerformanceLeaderboardFrameProps {
  summary?: PerformanceSummary;
}

export const PerformanceFrame: React.FC<PerformanceLeaderboardFrameProps> = ({
  summary,
}) => {
  return (
    <Card
      sx={{
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/users/${summary?.userId}`}
        disabled={!summary}
      >
        <Box p={2} sx={{ width: '100%' }}>
          <Stack direction="row" spacing={2}>
            <UserAvatar
              user={
                summary
                  ? { id: summary.userId, ...summary.userHead }
                  : undefined
              }
              size={64}
              shape="rounded"
            />
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <UsernameText user={summary?.userHead} />
                {summary && (
                  <RankingText rank={summary.position}>
                    #{summary.position}
                  </RankingText>
                )}
              </Stack>
              <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                {summary ? (
                  <>
                    <Tooltip arrow title="Performance Score">
                      <Chip
                        size="small"
                        avatar={<Whatshot />}
                        label={`${summary.score}`}
                        sx={{
                          color: getPointsColor(summary.score),
                        }}
                      />
                    </Tooltip>
                    <Tooltip arrow title="Performance Grade">
                      <Chip
                        size="small"
                        avatar={<Leaderboard />}
                        label={`${summary.scoreGrade}`}
                        sx={{
                          color: getPointsColor(summary.score),
                        }}
                      />
                    </Tooltip>
                    <Tooltip arrow title="Performance Trend">
                      <Chip
                        size="small"
                        icon={
                          <Box
                            component="span"
                            sx={(theme) => ({
                              color: theme.palette.text.primary,
                            })}
                          >
                            <TrendIcon grade={summary.trendGrade} />
                          </Box>
                        }
                        label={`${summary.trend}`}
                        sx={{
                          color: getPointsColor(summary.trend),
                        }}
                      />
                    </Tooltip>
                    {summary.activitySummary.postApprove ? (
                      <Tooltip arrow title="Posts Approved">
                        <Chip
                          size="small"
                          avatar={<Beenhere />}
                          label={`${summary.activitySummary.postApprove}`}
                        />
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                    {summary.activitySummary.ticketHandle ? (
                      <Tooltip arrow title="Tickets Handled">
                        <Chip
                          size="small"
                          avatar={<Sell />}
                          label={`${summary.activitySummary.ticketHandle}`}
                        />
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                    {summary.days > 1 && (
                      <Tooltip arrow title="Days Active">
                        <Chip
                          size="small"
                          avatar={<CalendarMonth />}
                          label={`${summary.days}`}
                        />
                      </Tooltip>
                    )}
                  </>
                ) : (
                  <Skeleton width={100} />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};
