import { ArrowForward, Whatshot } from '@mui/icons-material';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import { usePerformance } from '../api';
import { QueryHint } from '../common/QueryHint';
import { RankingText } from '../common/RankingText';
import { useChartValue } from '../utils/charts';
import { formatNumber } from '../utils/numbers';
import { refetchQueryOptions } from '../utils/query';
import { notableActivities } from './activities';
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
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          sx={{
            height: '100%',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
              }}
            >
              <Whatshot />
              <Typography
                variant="h6"
                sx={{ color: getScoreGradeColor(data?.scoreGrade) }}
              >
                {data ? (
                  formatNumber(data.score)
                ) : (
                  <Skeleton variant="text" width={60} />
                )}
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
          <Stack
            direction="row"
            sx={{
              flex: 1,
              gap: 2,
              rowGap: 1,
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              overflow: 'hidden',
            }}
          >
            {data
              ? notableActivities(data).map(({ key, label, count }) => (
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
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {formatNumber(count)}
                    </Typography>
                    <Typography variant="body2">{label.noun}</Typography>
                  </Stack>
                ))
              : Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="text" width={120} />
                ))}
          </Stack>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'flex-end',
            }}
          >
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
