import { useMemo, useState } from 'react';

import { ArrowForward, Check, Close, Whatshot } from '@mui/icons-material';
import {
  Box,
  Card,
  Skeleton,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LineChart } from '@mui/x-charts';
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import { useParams } from 'react-router';

import {
  PerformanceSummary,
  UserArea,
  usePerformance,
  usePerformanceSeries,
  usePerformanceWeights,
} from '../api';
import { QueryHint } from '../common/QueryHint';
import { ScreenshotPrinter } from '../common/ScreenshotPrinter';
import { Stamp } from '../common/Stamp';
import { UserAvatar } from '../common/UserAvatar';
import { UsernameText } from '../common/UsernameText';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { NavButton } from '../page/header/NavButton';
import { NavItem } from '../page/header/NavItem';
import { NavSpacer } from '../page/header/NavSpacer';
import { PageHeader } from '../page/header/PageHeader';
import { describeAction } from '../utils/activity';
import { useChartRange } from '../utils/charts';
import { formatNumber } from '../utils/numbers';
import { refetchQueryOptions } from '../utils/query';
import {
  TimeDuration,
  formatRangeLabel,
  formatSeriesDateLabel,
  inferDurationFromRange,
} from '../utils/ranges';
import { GradeBadge } from './GradeBadge';
import { getScoreGradeColor, getTrendGradeColor } from './color';

const CELL = 40;
const GAP = 4;

const longestRun = (marks: boolean[]): number =>
  marks.reduce(
    ([best, run], mark) => {
      const next = mark ? run + 1 : 0;
      return [Math.max(best, next), next];
    },
    [0, 0],
  )[0];

const SHEETS: Partial<Record<UserArea, { label: string; href: string }>> = {
  [UserArea.janitor]: { label: 'Janitors', href: '/janitors/performance' },
  [UserArea.moderator]: { label: 'Mods', href: '/mods/performance' },
};

const areaOfLevel = (level?: string): UserArea | undefined => {
  if (level === undefined) return undefined;
  return (
    Object.values(UserArea).find((area) => area === level.toLowerCase()) ??
    UserArea.member
  );
};

const AttendanceSheet: React.FC<{
  start: Date;
  end: Date;
  attendance?: Date[];
}> = ({ start, end, attendance }) => {
  const today = new Date();
  const last = subDays(end, 1);
  const days = eachDayOfInterval({
    start: startOfWeek(start),
    end: endOfWeek(last),
  });
  const weekdays = days.slice(0, 7);
  const shown = days.map(
    (day) =>
      !isBefore(day, start) && !isAfter(day, last) && !isAfter(day, today),
  );
  const marks = days.map(
    (day, index) =>
      shown[index]! &&
      (attendance?.some((date) => isSameDay(date, day)) ?? false),
  );
  const streak = attendance ? longestRun(marks) : 0;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          On the clock
        </Typography>
        {streak > 1 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {streak} day streak
          </Typography>
        )}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, minmax(0, ${CELL}px))`,
          gap: `${GAP}px`,
          justifyContent: 'center',
        }}
      >
        {weekdays.map((day) => (
          <Typography
            key={day.toISOString()}
            variant="caption"
            sx={{ textAlign: 'center', color: 'text.secondary' }}
          >
            {format(day, 'EEEEE')}
          </Typography>
        ))}
        {days.map((day, index) => {
          const inRange = shown[index]!;
          const active = marks[index]!;
          if (!attendance) {
            return (
              <Skeleton
                key={day.toISOString()}
                variant="rounded"
                height={CELL}
                sx={{ visibility: inRange ? 'visible' : 'hidden' }}
              />
            );
          }
          return (
            <Box
              key={day.toISOString()}
              sx={{
                height: CELL,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                visibility: inRange ? 'visible' : 'hidden',
                backgroundColor: 'action.hover',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: 2,
                  left: 4,
                  lineHeight: 1,
                  color: 'text.secondary',
                  opacity: 0.6,
                }}
              >
                {format(day, 'd')}
              </Typography>
              {active ? (
                <Check sx={{ color: 'primary.main' }} />
              ) : (
                <Close sx={{ color: 'text.secondary', opacity: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

const ScoreLine: React.FC<{ userId: number; focus?: string }> = ({
  userId,
  focus,
}) => {
  const theme = useTheme();
  const range = useChartRange();
  const { data, isLoading, error } = usePerformanceSeries(
    { ...range, userId },
    refetchQueryOptions(),
  );
  const points = useMemo(
    () =>
      data?.map((point) => ({
        date: point.date,
        score: focus ? (point.scores[focus] ?? 0) : point.score,
      })),
    [data, focus],
  );
  const peak = Math.max(0, ...(points?.map((point) => point.score) ?? []));

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typography variant="h6">Fire</Typography>
        {focus && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {describeAction(focus).name}
          </Typography>
        )}
      </Stack>
      <Box sx={{ height: 160 }}>
        <QueryHint
          data={points}
          isLoading={isLoading}
          isEmpty={points?.every((point) => point.score === 0)}
          error={error}
          type="lines"
        >
          <LineChart
            dataset={points ?? []}
            loading={isLoading}
            xAxis={[
              {
                scaleType: 'band',
                dataKey: 'date',
                position: 'none',
                valueFormatter: (value) =>
                  formatSeriesDateLabel(value, points!),
              },
            ]}
            yAxis={[
              {
                position: 'left',
                max: peak > 0 ? peak * 1.08 : undefined,
                tickInterval: peak > 0 ? [0, peak] : [0],
                disableLine: true,
                disableTicks: true,
                width: 48,
                valueFormatter: (value: number) =>
                  formatNumber(Math.round(value)),
              },
            ]}
            series={[
              {
                dataKey: 'score',
                label: 'Embers',
                color: theme.palette.primary.main,
                area: true,
                showMark: false,
                valueFormatter: (value) => formatNumber(Math.round(value ?? 0)),
              },
            ]}
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            hideLegend
            sx={{ '.MuiLineChart-area': { fillOpacity: 0.3 } }}
            localeText={{ noData: 'No data' }}
          />
        </QueryHint>
      </Box>
    </Stack>
  );
};

const ResultsSkeleton: React.FC = () => (
  <Stack spacing={0.5}>
    <Typography
      variant="h5"
      sx={{
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 6,
        fontWeight: 'bold',
        pb: 1.5,
      }}
    >
      Results
    </Typography>
    {Array.from({ length: 5 }).map((_, index) => (
      <Stack
        key={index}
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          px: { xs: 1, sm: 1.5 },
          py: 0.75,
          borderRadius: 1,
          backgroundColor: 'action.hover',
        }}
      >
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" sx={{ flexGrow: 1, maxWidth: 180 }} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="text" width={40} />
        <Skeleton variant="text" width={32} />
        <Skeleton variant="text" width={48} />
      </Stack>
    ))}
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', px: { xs: 1, sm: 1.5 }, pt: 1 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Your embers
      </Typography>
      <Skeleton variant="text" width={96} sx={{ fontSize: '2rem' }} />
    </Stack>
    <Stack sx={{ alignItems: 'flex-end', px: { xs: 1, sm: 1.5 }, pt: 1 }}>
      <Skeleton variant="text" width={140} />
      <Skeleton variant="rounded" width={200} height={36} />
    </Stack>
  </Stack>
);

const TermShelf: React.FC<{
  summary: PerformanceSummary;
  duration: TimeDuration;
}> = ({ summary, duration }) => {
  const theme = useTheme();
  const previous = summary.history.slice(1).reverse();
  const trend = `${summary.trend >= 0 ? '+' : ''}${formatNumber(summary.trend)}%`;
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        vs previous {duration}s
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {previous.map((record, index) => (
          <GradeBadge key={index} grade={record.grade} size={28} />
        ))}
        <Box sx={{ display: 'flex', color: 'text.secondary' }}>
          <ArrowForward fontSize="small" />
        </Box>
        <GradeBadge grade={summary.scoreGrade} size={36} />
        <Typography
          variant="body2"
          sx={{ color: getTrendGradeColor(theme, summary.trendGrade) }}
        >
          {trend}
        </Typography>
      </Stack>
    </Stack>
  );
};

const LevelClear: React.FC<{
  summary: PerformanceSummary;
  weights: Record<string, number>;
  duration: TimeDuration;
  focus?: string;
  onFocus: (key?: string) => void;
}> = ({ summary, weights, duration, focus, onFocus }) => (
  <Stack spacing={0.5}>
    <Typography
      variant="h5"
      sx={{
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 6,
        fontWeight: 'bold',
        pb: 1.5,
      }}
    >
      Results
    </Typography>
    {Object.entries(summary.activity)
      .filter(([, count]) => count > 0)
      .sort(([a, x], [b, y]) => y * (weights[b] ?? 0) - x * (weights[a] ?? 0))
      .map(([key, count]) => {
        const label = describeAction(key);
        const weight = weights[key] ?? 0;
        const focused = focus === key;
        return (
          <Stack
            key={key}
            direction="row"
            onClick={() => onFocus(focused ? undefined : key)}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              columnGap: 1.5,
              rowGap: 0.25,
              px: { xs: 1, sm: 1.5 },
              py: 0.75,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: focused ? 'action.selected' : 'action.hover',
              outline: focused ? '1px solid' : 'none',
              outlineColor: 'primary.main',
              color: 'text.secondary',
              '& svg': { fontSize: 20 },
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                flexGrow: 1,
                minWidth: { xs: '100%', sm: 0 },
              }}
            >
              <Box
                sx={{ width: 20, display: 'flex', justifyContent: 'center' }}
              >
                {label.icon}
              </Box>
              <Typography
                variant="body1"
                sx={{ color: 'text.primary', minWidth: 0 }}
              >
                {label.name}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', marginLeft: 'auto' }}
            >
              <Typography
                variant="body1"
                sx={{ width: 64, textAlign: 'right' }}
              >
                {formatNumber(count)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ width: 56, textAlign: 'right' }}
              >
                ×{formatMultiplier(weight)}
              </Typography>
              <Typography
                variant="body1"
                sx={{ width: 72, textAlign: 'right', color: 'text.primary' }}
              >
                {formatNumber(Math.round(count * weight))}
              </Typography>
            </Stack>
          </Stack>
        );
      })}
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', px: { xs: 1, sm: 1.5 }, pt: 1 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Your embers
      </Typography>
      <Box
        sx={{ display: 'flex', color: getScoreGradeColor(summary.scoreGrade) }}
      >
        <Whatshot />
      </Box>
      <Typography
        variant="h4"
        sx={{ color: getScoreGradeColor(summary.scoreGrade) }}
      >
        {formatNumber(summary.score)}
      </Typography>
    </Stack>
    <Box sx={{ px: { xs: 1, sm: 1.5 }, pt: 1 }}>
      <TermShelf summary={summary} duration={duration} />
    </Box>
  </Stack>
);

const formatMultiplier = (weight: number): string =>
  Number.isInteger(weight) ? String(weight) : weight.toFixed(1);

const ReportCard: React.FC<{
  userId: number;
  summary?: PerformanceSummary;
  weights?: Record<string, number>;
  start: Date;
  end: Date;
  term: string;
  duration: TimeDuration;
}> = ({ userId, summary, weights, start, end, term, duration }) => {
  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const badge = compact ? 64 : 90;
  const [focus, setFocus] = useState<string>();
  return (
    <Stack spacing={4}>
      <Stack
        direction="row"
        spacing={{ xs: 2, sm: 3 }}
        sx={{ alignItems: 'center' }}
      >
        <UserAvatar
          user={summary ? { id: summary.userId, ...summary.head } : undefined}
          size={badge}
          shape="rounded"
        />
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <UsernameText user={summary} variant="h4" />
          <Typography variant="h6" color="primary">
            {summary?.head?.level ?? <Skeleton variant="text" width={100} />}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {term}
          </Typography>
        </Stack>
        {summary ? (
          <Stamp size={badge} color={getScoreGradeColor(summary.scoreGrade)}>
            {summary.scoreGrade}
          </Stamp>
        ) : (
          <Skeleton variant="circular" width={badge} height={badge} />
        )}
      </Stack>
      {(duration === TimeDuration.Week || duration === TimeDuration.Month) && (
        <AttendanceSheet
          start={start}
          end={end}
          attendance={summary?.attendance}
        />
      )}
      <ScoreLine userId={userId} focus={focus} />
      {summary && weights ? (
        <LevelClear
          summary={summary}
          weights={weights}
          duration={duration}
          focus={focus}
          onFocus={setFocus}
        />
      ) : (
        <ResultsSkeleton />
      )}
    </Stack>
  );
};

export const PerformanceDetailPage: React.FC = () => {
  const range = useChartRange();
  const { id: userId } = useParams<{ id: string }>();
  const chartDuration = useMemo(
    () => inferDurationFromRange(range.startDate, range.endDate),
    [range.startDate, range.endDate],
  );
  const rangeLabel = useMemo(
    () => formatRangeLabel(range.startDate, range.endDate, chartDuration),
    [range.startDate, range.endDate, chartDuration],
  );

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

  const area = areaOfLevel(summary?.head?.level);
  const sheet = area ? SHEETS[area] : undefined;
  const { data: weights } = usePerformanceWeights(
    { area },
    { query: { ...refetchQueryOptions(), enabled: area !== undefined } },
  );

  return (
    <Page>
      <PageTitle
        subtitle={
          summary?.head?.name
            ? `Performance - ${summary?.head?.name}`
            : 'Performance'
        }
      />
      <ScreenshotPrinter
        filename={`Performance ${summary?.head?.name || userId} ${rangeLabel}`}
        targetId="performance-detail-root"
      >
        {(handlePrint) => (
          <>
            <PageHeader
              actions={[
                <NavItem
                  key="profile"
                  href={`/users/${userId}`}
                  label="Profile"
                />,
                ...(sheet
                  ? [
                      <NavItem
                        key="sheet"
                        href={sheet.href}
                        label={sheet.label}
                      />,
                    ]
                  : []),
                <NavSpacer key="spacer" />,
                <NavButton
                  key="print"
                  onClick={handlePrint}
                  disabled={isLoading}
                >
                  Print
                </NavButton>,
              ]}
            />
            <PageBody>
              <Box sx={{ width: '100%', maxWidth: 720, margin: 'auto' }}>
                <Box id="performance-detail-root" sx={{ p: { xs: 1, sm: 2 } }}>
                  <Card>
                    <Box sx={{ p: { xs: 2, sm: 4 } }}>
                      <QueryHint error={error} isEmpty={!summary && !isLoading}>
                        <ReportCard
                          userId={Number(userId ?? 0)}
                          summary={summary}
                          weights={weights?.weights}
                          duration={chartDuration}
                          start={range.startDate}
                          end={range.endDate}
                          term={rangeLabel}
                        />
                      </QueryHint>
                    </Box>
                  </Card>
                </Box>
              </Box>
            </PageBody>
            <PageFooter />
          </>
        )}
      </ScreenshotPrinter>
    </Page>
  );
};
