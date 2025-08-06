import { ArrowForward, Whatshot } from '@mui/icons-material';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { usePerformance } from '../api';
import { LimitedList } from '../common/LimitedList';
import { QueryHint } from '../common/QueryHint';
import { RankingText } from '../common/RankingText';
import { getActivityFromKey, getActivityName } from '../utils/activity';
import { useChartValue } from '../utils/charts';
import { formatNumber } from '../utils/numbers';
import { refetchQueryOptions } from '../utils/query';
import { useGradeColors } from './color';

export const PerformanceCard: React.FC = () => {
  const { range, userId, area } = useChartValue();
  const { getScoreGradeColor } = useGradeColors();

  const { data, isLoading, error } = usePerformance(
    {
      ...range,
      userId,
      area,
    },
    {
      query: {
        select: (data) => data?.[0],
        ...refetchQueryOptions(),
      },
    },
  );

  return (
    <QueryHint isEmpty={!data && !isLoading} error={error}>
      <Box width="100%" height="100%" overflow="hidden">
        <Stack direction="column" spacing={2} height="100%">
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Whatshot />
              <Typography
                variant="h6"
                sx={{
                  color: getScoreGradeColor(data?.scoreGrade),
                }}
              >
                {data ? data.score : <Skeleton variant="text" width={60} />}
              </Typography>
            </Stack>
            {data ? (
              <RankingText rank={data.position} variant="h6">
                #{data.position}
              </RankingText>
            ) : (
              <Typography variant="h6">
                <Skeleton variant="text" width={60} />
              </Typography>
            )}
          </Stack>
          <Stack direction="column" spacing={1} flex={1} overflow="hidden">
            <LimitedList>
              {data
                ? Object.entries(data.activity)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([type, value]) => (
                      <Stack
                        key={type}
                        direction="row"
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Typography variant="body1">
                          {getActivityName(getActivityFromKey(type))}
                        </Typography>
                        <Typography variant="body1">
                          {formatNumber(value)}
                        </Typography>
                      </Stack>
                    ))
                : Array.from({ length: 3 }).map((_, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                    >
                      <Skeleton variant="text" width={100} />
                      <Skeleton variant="text" width={30} />
                    </Stack>
                  ))}
            </LimitedList>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to={`/performance/${userId}`}
            >
              See Full Report
            </Button>
          </Stack>
        </Stack>
      </Box>
    </QueryHint>
  );
};
