import {
  Beenhere,
  CalendarMonth,
  Flag,
  RestartAlt,
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
import { UserAvatar, UsernameText } from '../../common';
import { RankingText } from '../../common/RankingText';
import { getScoreGradeColor } from './color';

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
            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
              <Stack direction="column" spacing={1} sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <UsernameText user={summary?.userHead} />
                </Stack>
                <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                  {summary ? (
                    <>
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
                      {summary.activitySummary.postReplacementApprove ? (
                        <Tooltip arrow title="Replacements Approved">
                          <Chip
                            size="small"
                            avatar={<RestartAlt />}
                            label={`${summary.activitySummary.postReplacementApprove}`}
                          />
                        </Tooltip>
                      ) : (
                        <></>
                      )}
                      {summary.activitySummary.postDelete ? (
                        <Tooltip arrow title="Posts Deleted">
                          <Chip
                            size="small"
                            avatar={<Flag />}
                            label={`${summary.activitySummary.postDelete}`}
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
              {summary && (
                <Stack direction="column" alignItems="flex-end" gap={1}>
                  <Box sx={{ minHeight: 32 }}>
                    <RankingText rank={summary.position}>
                      #{summary.position}
                    </RankingText>
                  </Box>
                  <Tooltip arrow title="Performance Score">
                    <Chip
                      size="small"
                      avatar={<Whatshot />}
                      label={`${summary.score}`}
                      sx={{
                        color: getScoreGradeColor(summary.scoreGrade),
                      }}
                    />
                  </Tooltip>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};
