import { Whatshot } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router';

import { PerformanceSummary } from '../api';
import { RankingText } from '../common/RankingText';
import { UserAvatar } from '../common/UserAvatar';
import { UsernameText } from '../common/UsernameText';
import { formatNumber } from '../utils/numbers';
import { notableActivities } from './activities';
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
        <Box
          sx={{
            p: 2,
            width: '100%',
          }}
        >
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
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <UsernameText user={summary} />
                </Stack>
                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {summary ? (
                    notableActivities(summary)
                      .slice(0, 3)
                      .map(({ key, label, count }) => (
                        <Stack
                          key={key}
                          direction="row"
                          spacing={0.5}
                          sx={{
                            alignItems: 'center',
                            color: 'text.secondary',
                            whiteSpace: 'nowrap',
                            '& svg': { fontSize: 18 },
                          }}
                        >
                          {label.icon}
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.primary' }}
                          >
                            {formatNumber(count)}
                          </Typography>
                          <Typography variant="body2">{label.noun}</Typography>
                        </Stack>
                      ))
                  ) : (
                    <Skeleton width={100} />
                  )}
                </Stack>
              </Stack>
              {summary && (
                <Stack
                  direction="column"
                  sx={{
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  <Box sx={{ minHeight: 32 }}>
                    <RankingText rank={summary.position}>
                      #{summary.position}
                    </RankingText>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Whatshot fontSize="small" />
                    <Typography
                      variant="subtitle1"
                      sx={{ color: getScoreGradeColor(summary.scoreGrade) }}
                    >
                      {formatNumber(summary.score)}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};
