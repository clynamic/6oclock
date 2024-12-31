import { SwapHoriz } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { SparkLineChart } from '@mui/x-charts';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Activity, usePerformance } from '../../api';
import {
  QueryHint,
  RankingText,
  Stamp,
  TrendIcon,
  UserAvatar,
  UsernameText,
} from '../../common';
import {
  NavButton,
  Page,
  PageBody,
  PageFooter,
  PageHeader,
  PageTitle,
} from '../../page';
import {
  DateRange,
  getActivityName,
  refetchQueryOptions,
  useChartDateRange,
} from '../../utils';
import { getScoreGradeColor } from './color';

export const PerformanceDetailPage: React.FC = () => {
  const range = useChartDateRange();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const [lastMonth, setLastMonth] = useState<boolean>(false);

  const selectedRange = useMemo<DateRange>(() => {
    if (lastMonth) {
      return {
        ...range,
        startDate: DateTime.fromJSDate(range.startDate)
          .minus({ month: 1 })
          .toJSDate(),
        endDate: DateTime.fromJSDate(range.endDate)
          .minus({ month: 1 })
          .toJSDate(),
      };
    }
    return range;
  }, [lastMonth, range]);

  const {
    data: summary,
    isLoading,
    error,
  } = usePerformance(
    {
      ...selectedRange,
      userId: Number(id ?? 0),
      head: true,
    },
    {
      query: {
        ...refetchQueryOptions(),
        enabled: id !== undefined,
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
        actions={
          // TODO: these are terribly hardcoded. We should expand our nav logic to dynamically generate these.
          (summary?.userId && [
            <NavButton
              key="profile"
              component={Link}
              {...{ to: `/users/${summary?.userId}` }}
            >
              Profile
            </NavButton>,
            <NavButton
              key="performance"
              component={Link}
              {...{ to: `/users/${summary?.userId}/performance` }}
            >
              Performance
            </NavButton>,
          ]) ||
          []
        }
      />
      <PageBody>
        <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', p: 2 }}>
          <QueryHint error={error} isEmpty={!summary && !isLoading}>
            <Stack sx={{ height: '100%', width: '100%', gap: 1 }}>
              <Stack direction="column">
                <Card>
                  <Box p={4} sx={{ width: '100%' }}>
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
                                {`${selectedRange.startDate.toLocaleDateString()} - ${selectedRange.endDate.toLocaleDateString()}`}
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
                              color: getScoreGradeColor(summary?.scoreGrade),
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
                          <Typography variant="h6">Scores</Typography>
                          {summary ? (
                            <SparkLineChart
                              data={[
                                ...summary.previousScores.reverse(),
                                summary.score,
                              ]}
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
                              ? Object.entries(summary.activitySummary).map(
                                  ([type, value]) => (
                                    <Stack
                                      key={type}
                                      direction="row"
                                      gap={1}
                                      justifyContent="space-between"
                                    >
                                      <Typography variant="caption">
                                        {getActivityName(
                                          Object.values(Activity).find(
                                            (activity) =>
                                              activity.replace(/_/g, '') ===
                                              type.toLowerCase(),
                                          ) as Activity,
                                        )}
                                      </Typography>
                                      <Tooltip title={type}>
                                        <Typography variant="caption">
                                          {value}
                                        </Typography>
                                      </Tooltip>
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
                  </Box>
                </Card>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={{
                    marginTop: 2,
                  }}
                >
                  <Button
                    size="small"
                    endIcon={<SwapHoriz />}
                    onClick={() => setLastMonth(!lastMonth)}
                  >
                    {lastMonth ? 'View This Month' : 'View Last Month'}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
