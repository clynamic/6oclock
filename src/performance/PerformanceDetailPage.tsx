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
import { UserAvatar } from '../common/UserAvatar';
import { TrendIcon } from '../common/TrendIcon';
import { UsernameText } from '../common/UsernameText';
import { QueryHint } from '../common/QueryHint';
import { RankingText } from '../common/RankingText';
import { Stamp } from '../common/Stamp';
import { PageBody } from '../page/PageBody';
import { PageTitle } from '../page/PageTitle';
import { PageFooter } from '../page/PageFooter';
import { Page } from '../page/Page';
import { PageHeader } from '../page/header/PageHeader';
import { formatNumber } from '../utils/numbers';
import { refetchQueryOptions } from '../utils/query';
import { getActivityFromKey, getActivityName } from '../utils/activity';
import { useChartRange } from '../utils/charts';
import { useGradeColors } from './color';
import { NavSpacer } from '../page/header/NavSpacer';
import { NavItem } from '../page/header/NavItem';

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
        actions={[
          <NavItem key="profile" href={`/users/${userId}`} label="Profile" />,
          <NavSpacer key="spacer" />,
        ]}
      />
      <PageBody>
        <Box
          sx={{
            overflowX: 'auto',
            maxWidth: 800,
            width: '100%',
          }}
        >
          <Box id="performance-detail-root" p={2}>
            <Card sx={{ minWidth: 550 }}>
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
                          <Skeleton variant="circular" width={90} height={90} />
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
          </Box>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
