import { CalendarMonth, Whatshot } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Skeleton,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { PerformanceSummary } from '../api';
import { RankingText } from '../common/RankingText';
import { UserAvatar } from '../common/UserAvatar';
import { UsernameText } from '../common/UsernameText';
import {
  getActivityFromKey,
  getActivityIcon,
  getActivityNoun,
} from '../utils/activity';
import { formatNumber } from '../utils/numbers';
import { useGradeColors } from './color';

export interface PerformanceLeaderboardFrameProps {
  summary?: PerformanceSummary;
}

export const PerformanceFrame: React.FC<PerformanceLeaderboardFrameProps> = ({
  summary,
}) => {
  const { getScoreGradeColor } = useGradeColors();

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
                summary ? { id: summary.userId, ...summary.head } : undefined
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
                  <UsernameText user={summary} />
                </Stack>
                <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                  {summary ? (
                    <>
                      {Object.entries(summary.activity)
                        .map(([key, count]) => ({
                          key,
                          activity: getActivityFromKey(key),
                          count: count as number,
                        }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 2)
                        .map(({ key, activity, count }) => (
                          <Chip
                            key={key}
                            size="small"
                            avatar={getActivityIcon(activity)}
                            label={`${formatNumber(count)} ${getActivityNoun(activity)}`}
                          />
                        ))}
                      {summary.days > 1 && (
                        <Chip
                          size="small"
                          avatar={<CalendarMonth />}
                          label={`${summary.days} Days`}
                        />
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
                  <Chip
                    size="small"
                    avatar={<Whatshot />}
                    label={`${summary.score}`}
                    sx={{
                      color: getScoreGradeColor(summary.scoreGrade),
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};
