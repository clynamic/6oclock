import { useMemo } from 'react';

import { Whatshot } from '@mui/icons-material';
import { Box, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import { SparkLineChart } from '@mui/x-charts';
import { useNavigate } from 'react-router';

import { PerformanceSummary, usePerformance } from '../api';
import { LimitedList } from '../common/LimitedList';
import { QueryHint } from '../common/QueryHint';
import { RankingText } from '../common/RankingText';
import { ScreenshotPrinter } from '../common/ScreenshotPrinter';
import { UserAvatar } from '../common/UserAvatar';
import { UsernameText } from '../common/UsernameText';
import { Page } from '../page/Page';
import { PageBody } from '../page/PageBody';
import { PageFooter } from '../page/PageFooter';
import { PageTitle } from '../page/PageTitle';
import { NavButton } from '../page/header/NavButton';
import { NavSpacer } from '../page/header/NavSpacer';
import { PageHeader } from '../page/header/PageHeader';
import { useChartValue } from '../utils/charts';
import { formatNumber } from '../utils/numbers';
import { refetchQueryOptions } from '../utils/query';
import { formatRangeLabel, inferDurationFromRange } from '../utils/ranges';
import { capitalizeWords } from '../utils/strings';
import { GradeBadge } from './GradeBadge';
import { notableActivities } from './activities';
import { getScoreGradeColor } from './color';
import { filterCompeting } from './competing';
import { exportPerformanceToCSV } from './export';

const ROW_HEIGHT = 56;

const ActivityList: React.FC<{
  summary: PerformanceSummary;
  dense?: boolean;
}> = ({ summary, dense }) => (
  <LimitedList
    sx={{
      flexDirection: 'row',
      gap: dense ? 1.5 : 2,
      height: 'auto',
      flexGrow: 1,
      minWidth: 0,
    }}
  >
    {notableActivities(summary).map(({ key, label, count }) => (
      <Stack
        key={key}
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: 'center',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          '& svg': { fontSize: dense ? 16 : 20 },
        }}
      >
        {label.icon}
        <Typography
          variant={dense ? 'body2' : 'body1'}
          sx={{ color: 'text.primary' }}
        >
          {formatNumber(count)}
        </Typography>
        <Typography variant="body2">{label.noun}</Typography>
      </Stack>
    ))}
  </LimitedList>
);

const rowSx = {
  px: 1,
  borderRadius: 1,
  cursor: 'pointer',
  '&:hover': { backgroundColor: 'action.hover' },
};

const CompactRow: React.FC<{ summary: PerformanceSummary }> = ({ summary }) => {
  const navigate = useNavigate();

  return (
    <Stack
      spacing={0.75}
      onClick={() => navigate(`/performance/${summary.userId}`)}
      sx={{ ...rowSx, py: 1 }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 40, flexShrink: 0 }}>
          <RankingText rank={summary.position} variant="subtitle1">
            #{summary.position}
          </RankingText>
        </Box>
        <UserAvatar
          user={{ id: summary.userId, ...summary.head }}
          size={36}
          shape="rounded"
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <UsernameText variant="subtitle1" user={summary} />
        </Box>
        <GradeBadge grade={summary.scoreGrade} size={32} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <ActivityList summary={summary} dense />
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexShrink: 0, alignItems: 'center' }}
        >
          <Whatshot fontSize="small" />
          <Typography variant="subtitle1">
            {formatNumber(summary.score)}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

const WideRow: React.FC<{ summary: PerformanceSummary }> = ({ summary }) => {
  const navigate = useNavigate();
  const color = getScoreGradeColor(summary.scoreGrade);

  return (
    <Stack
      direction="row"
      spacing={2}
      onClick={() => navigate(`/performance/${summary.userId}`)}
      sx={{ ...rowSx, alignItems: 'center', height: ROW_HEIGHT + 12, px: 1.5 }}
    >
      <Box sx={{ width: 56, flexShrink: 0 }}>
        <RankingText rank={summary.position} variant="h6">
          #{summary.position}
        </RankingText>
      </Box>
      <UserAvatar
        user={{ id: summary.userId, ...summary.head }}
        size={ROW_HEIGHT}
        shape="rounded"
      />
      <Stack sx={{ flexGrow: 1, minWidth: 0 }} spacing={0.5}>
        <UsernameText variant="subtitle1" user={summary} />
        <ActivityList summary={summary} />
      </Stack>
      <Box sx={{ width: 160, height: ROW_HEIGHT, flexShrink: 0 }}>
        <SparkLineChart
          data={[...summary.history].reverse().map((record) => record.score)}
          height={ROW_HEIGHT}
          color={color}
          area
          sx={{
            '.MuiLineChart-area': {
              fillOpacity: 0.5,
            },
          }}
        />
      </Box>
      <GradeBadge grade={summary.scoreGrade} />
      <Stack
        direction="row"
        spacing={1}
        sx={{
          flexShrink: 0,
          alignItems: 'center',
          width: 104,
          justifyContent: 'flex-end',
        }}
      >
        <Whatshot />
        <Typography variant="h5">{formatNumber(summary.score)}</Typography>
      </Stack>
    </Stack>
  );
};

const PerformanceRow: React.FC<{ summary: PerformanceSummary }> = ({
  summary,
}) => {
  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  return compact ? (
    <CompactRow summary={summary} />
  ) : (
    <WideRow summary={summary} />
  );
};

export const PerformanceTable: React.FC = () => {
  const { range, area } = useChartValue();
  const chartDuration = useMemo(
    () => inferDurationFromRange(range.startDate, range.endDate),
    [range.startDate, range.endDate],
  );
  const rangeLabel = useMemo(
    () => formatRangeLabel(range.startDate, range.endDate, chartDuration),
    [range.startDate, range.endDate, chartDuration],
  );

  const {
    data: board,
    isLoading,
    error,
  } = usePerformance(
    {
      ...range,
      area,
      head: true,
    },
    refetchQueryOptions(),
  );
  const data = useMemo(() => filterCompeting(board), [board]);
  const omitted = (board?.length ?? 0) - (data?.length ?? 0);

  const handleExport = () => {
    if (!board) return;
    exportPerformanceToCSV(board, area, range);
  };

  return (
    <Page>
      <PageTitle subtitle="Performance" />
      <ScreenshotPrinter
        filename={`Performance ${capitalizeWords(area || 'sheet')} ${rangeLabel}`}
        targetId="performance-table-root"
      >
        {(handlePrint) => (
          <>
            <PageHeader
              actions={[
                <NavSpacer />,
                <NavButton
                  key="print"
                  onClick={handlePrint}
                  disabled={isLoading}
                >
                  Print
                </NavButton>,
                <NavButton
                  key="export-performance"
                  onClick={handleExport}
                  disabled={isLoading}
                >
                  Export
                </NavButton>,
              ]}
            />
            <PageBody>
              <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 2 }}>
                <QueryHint data={data} isLoading={isLoading} error={error}>
                  <Stack spacing={2} id="performance-table-root" sx={{ p: 1 }}>
                    <Typography variant="h6">{rangeLabel}</Typography>
                    <Stack spacing={0}>
                      {data?.map((summary) => (
                        <PerformanceRow
                          key={summary.userId}
                          summary={summary}
                        />
                      ))}
                    </Stack>
                    {omitted > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {omitted === 1
                          ? '1 contributor not shown'
                          : `${omitted} contributors not shown`}
                      </Typography>
                    )}
                  </Stack>
                </QueryHint>
              </Box>
            </PageBody>
          </>
        )}
      </ScreenshotPrinter>
      <PageFooter />
    </Page>
  );
};
