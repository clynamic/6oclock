import {
  Box,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { SparkLineChart } from '@mui/x-charts';
import { useParams } from 'react-router-dom';

import { usePerformance } from '../api';
import {
  QueryHint,
  RankingText,
  Stamp,
  TrendIcon,
  UserAvatar,
  UsernameText,
} from '../common';
import {
  NavLink,
  Page,
  PageBody,
  PageFooter,
  PageHeader,
  PageTitle,
} from '../page';
import {
  formatNumber,
  getActivityFromKey,
  getActivityName,
  refetchQueryOptions,
  useChartRange,
} from '../utils';
import { useGradeColors } from './color';

export const PerformanceDetailPage: React.FC = () => {
  const range = useChartRange();
  const { id: userId } = useParams<{ id: string }>();
  const theme = useTheme();
  const { getScoreGradeColor, getTrendGradeColor } = useGradeColors();

  const {
    data: summary,
    isLoading,
    error,
  } = usePerformance(
    {
      ...range,
      userId: Number(userId ?? 0),
      head: true,
    },
    {
      query: {
        ...refetchQueryOptions(),
        enabled: userId !== undefined,
        select: (data) => data?.[0],
      },
    },
  );

  return (
    <Page>
      <PageTitle
        subtitle={
          summary?.userHead?.name
            ? `Performance - ${summary?.userHead?.name}`
            : 'Performance'
        }
      />
      <PageHeader
        actions={[<NavLink href={`/users/${userId}`} label="Profile" />]}
      />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', p: 2 }}>
          <Stack sx={{ height: '100%', width: '100%', gap: 1 }}>
            <Stack direction="column">
              <Card>
                <Box p={4} sx={{ width: '100%' }}>
                  <QueryHint error={error} isEmpty={!summary && !isLoading}>
                    <Stack direction="column" spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <UserAvatar
                          user={
                            summary
                              ? { id: summary.userId, ...summary.userHead }
                              : undefined
                          }
                          size={90}
                          shape="rounded"
                        />
                        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                          <Stack
                            direction="column"
                            spacing={1}
                            sx={{ flexGrow: 1 }}
                          >
                            <Stack direction="column">
                              <UsernameText
                                user={summary?.userHead}
                                variant="h4"
                              />
                              <Typography variant="h5">
                                {summary ? (
                                  summary?.userHead?.level
                                ) : (
                                  <Skeleton variant="text" width={100} />
                                )}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {`${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`}
                              </Typography>
                            </Stack>
                          </Stack>
                          {summary ? (
                            <Stack
                              direction="column"
                              alignItems={'center'}
                              gap={2}
                            >
                              <Stamp
                                size={90}
                                color={getScoreGradeColor(summary.scoreGrade)}
                              >
                                {summary.scoreGrade}
                              </Stamp>
                            </Stack>
                          ) : (
                            <Skeleton
                              variant="circular"
                              width={90}
                              height={90}
                            />
                          )}
                        </Stack>
                      </Stack>
                      <Stack
                        direction="row"
                        justifyContent={'space-between'}
                        gap={2}
                        sx={{
                          alignSelf: 'center',
                          width: 400,
                        }}
                      >
                        <Stack direction="column" alignItems="center">
                          {summary ? (
                            <RankingText rank={summary.position} variant="h4">
                              #{summary.position}
                            </RankingText>
                          ) : (
                            <Typography variant="h4">
                              <Skeleton variant="text" width={60} />
                            </Typography>
                          )}
                          <Typography variant="subtitle1">Rank</Typography>
                        </Stack>
                        <Divider orientation="vertical" flexItem />
                        <Stack direction="column" alignItems="center">
                          <Typography
                            variant="h4"
                            sx={{
                              color: getScoreGradeColor(summary?.scoreGrade),
                            }}
                          >
                            {summary ? (
                              summary.score
                            ) : (
                              <Skeleton variant="text" width={60} />
                            )}
                          </Typography>
                          <Typography variant="subtitle1">Score</Typography>
                        </Stack>
                        <Divider orientation="vertical" flexItem />
                        <Stack direction="column" alignItems="center">
                          <Typography
                            variant="h4"
                            sx={{
                              color: getTrendGradeColor(summary?.trendGrade),
                            }}
                          >
                            {summary ? (
                              <TrendIcon grade={summary.trendGrade} size={36} />
                            ) : (
                              <Skeleton variant="text" width={60} />
                            )}
                          </Typography>
                          <Typography variant="subtitle1">Trend</Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" gap={2}>
                        <Stack
                          direction="column"
                          sx={{
                            flex: 1,
                          }}
                        >
                          <Typography variant="h6" sx={{ userSelect: 'none' }}>
                            Scores
                          </Typography>
                          {summary ? (
                            <SparkLineChart
                              data={[...summary.history]
                                .reverse()
                                .map((e) => e.score)}
                              area
                              height={116}
                              showTooltip
                              showHighlight
                              colors={[theme.palette.primary.main]}
                              sx={{
                                '.MuiAreaElement-root': {
                                  fill: theme.palette.primary.main,
                                  opacity: 0.3,
                                },
                              }}
                            />
                          ) : (
                            <Skeleton variant="rectangular" height={116} />
                          )}
                        </Stack>
                        <Stack
                          direction="column"
                          spacing={1}
                          sx={{
                            flex: 1,
                          }}
                        >
                          <Typography variant="h6">Stats</Typography>
                          {summary ? (
                            <Stack
                              direction="row"
                              gap={1}
                              justifyContent="space-between"
                            >
                              <Typography variant="caption">
                                {`Active Days`}
                              </Typography>
                              <Typography variant="caption">
                                {`${summary.days}`}
                              </Typography>
                            </Stack>
                          ) : (
                            <></>
                          )}
                          <Stack direction="column" spacing={1}>
                            {summary
                              ? Object.entries(summary.activity).map(
                                  ([type, value]) => (
                                    <Stack
                                      key={type}
                                      direction="row"
                                      gap={1}
                                      justifyContent="space-between"
                                    >
                                      <Typography variant="caption">
                                        {getActivityName(
                                          getActivityFromKey(type),
                                        )}
                                      </Typography>
                                      <Typography variant="caption">
                                        {formatNumber(value)}
                                      </Typography>
                                    </Stack>
                                  ),
                                )
                              : Array.from({ length: 3 }).map((_, index) => (
                                  <Stack
                                    key={index}
                                    direction="row"
                                    gap={1}
                                    justifyContent="space-between"
                                  >
                                    <Skeleton variant="text" width={100} />
                                    <Skeleton variant="text" width={30} />
                                  </Stack>
                                ))}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </QueryHint>
                </Box>
              </Card>
            </Stack>
          </Stack>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
