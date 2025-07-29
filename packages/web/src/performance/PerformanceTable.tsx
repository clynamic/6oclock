import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { addDays, addMonths, addWeeks, addYears, format } from 'date-fns';
import { mix } from 'polished';
import React, { PropsWithChildren, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PerformanceGrade, TrendGrade, usePerformance } from '../api';
import {
  QueryHint,
  RankingText,
  ScreenshotPrinter,
  TrendIcon,
  UserAvatar,
  UsernameText,
} from '../common';
import {
  NavButton,
  NavSpacer,
  Page,
  PageBody,
  PageFooter,
  PageHeader,
  PageTitle,
} from '../page';
import {
  formatNumber,
  formatRangeLabel,
  getActivityFromKey,
  getActivityNoun,
  inferDurationFromRange,
  refetchQueryOptions,
  TimeDuration,
  unitFromDuration,
  useChartValue,
} from '../utils';
import { useGradeColors } from './color';

const SpaceCell: React.FC = () => (
  <TableCell>
    <Box
      component="span"
      sx={{
        width: 1,
        display: 'contents',
      }}
    />
  </TableCell>
);

const GradeCell: React.FC<
  PropsWithChildren<
    {
      grade: TrendGrade | PerformanceGrade;
    } & TableCellProps
  >
> = ({ grade, children, ...props }) => {
  const { getScoreGradeColor, getTrendGradeColor } = useGradeColors();
  return (
    <TableCell
      {...props}
      align="center"
      sx={{
        backgroundColor: mix(
          0.25,
          '#808080',
          (grade in PerformanceGrade
            ? getScoreGradeColor(grade as PerformanceGrade)
            : getTrendGradeColor(grade as TrendGrade)) ?? 'transparent',
        ),
      }}
    >
      {children}
    </TableCell>
  );
};

export const PerformanceTable: React.FC = () => {
  const { range, area } = useChartValue();
  const chartDuration = useMemo(
    () => inferDurationFromRange(range.startDate, range.endDate),
    [range.startDate, range.endDate],
  );
  const navigate = useNavigate();

  const { data, isLoading, error } = usePerformance(
    {
      ...range,
      area,
      head: true,
    },
    refetchQueryOptions(),
  );

  const periods = useMemo(() => {
    const labels = [];
    const durationUnit = unitFromDuration(chartDuration);
    let date = new Date(range.startDate);

    for (let i = 0; i < 4; i++) {
      switch (chartDuration) {
        case TimeDuration.Day:
          labels.push(format(date, 'MMM dd'));
          break;
        case TimeDuration.Week:
          labels.push(format(date, "'W'w MMM"));
          break;
        case TimeDuration.Month:
          labels.push(format(date, 'MMMM'));
          break;
        case TimeDuration.Year:
          labels.push(format(date, 'yyyy'));
          break;
        default:
          labels.push(format(date, 'MMMM'));
      }
      // Subtract one period
      switch (durationUnit) {
        case 'day':
          date = addDays(date, -1);
          break;
        case 'week':
          date = addWeeks(date, -1);
          break;
        case 'month':
          date = addMonths(date, -1);
          break;
        case 'year':
          date = addYears(date, -1);
          break;
      }
    }
    return labels;
  }, [range.startDate, chartDuration]);

  const activities = useMemo(() => {
    const activities = new Set<string>();
    data?.forEach((summary) => {
      Object.keys(summary.activity).forEach((type) => {
        activities.add(type);
      });
    });
    return Array.from(activities).sort();
  }, [data]);

  return (
    <Page>
      <PageTitle subtitle="Performance" />
      <ScreenshotPrinter
        filename={`${area}-performance-${format(range.startDate, 'yyyy-MM-dd')}`}
        targetId="performance-table-root"
      >
        {(handlePrint) => (
          <>
            <PageHeader
              actions={[
                <NavSpacer />,
                <NavButton key="print" onClick={handlePrint}>
                  Print
                </NavButton>,
              ]}
            />
            <PageBody>
              <Box
                sx={{
                  p: 2,
                  overflowX: 'auto',
                  maxWidth: '100%',
                }}
              >
                <QueryHint data={data} isLoading={isLoading} error={error}>
                  <Stack
                    sx={{
                      p: 2,
                      width: 'fit-content',
                    }}
                    id="performance-table-root"
                  >
                    <Typography variant="h6">
                      {formatRangeLabel(
                        range.startDate,
                        range.endDate,
                        chartDuration,
                      )}
                    </Typography>
                    <Table size="small" sx={{ width: 'fit-content' }}>
                      <TableHead>
                        <TableRow>
                          <SpaceCell />
                          <SpaceCell />
                          <TableCell>Name</TableCell>
                          <SpaceCell />
                          {activities.sort().map((type) => (
                            <TableCell key={type}>
                              {getActivityNoun(getActivityFromKey(type))}
                            </TableCell>
                          ))}
                          <SpaceCell />
                          {[...periods.slice(1)].reverse().map((period) => (
                            <TableCell key={period}>{period}</TableCell>
                          ))}
                          <SpaceCell />
                          <TableCell>{periods[0]}</TableCell>
                          <TableCell>Grade</TableCell>
                          <TableCell>Trend</TableCell>
                          <TableCell>Trend</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data?.map((summary) => (
                          <TableRow
                            key={summary.userId}
                            hover
                            sx={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              navigate(`/performance/${summary.userId}`);
                            }}
                          >
                            <TableCell
                              sx={{
                                userSelect: 'none',
                              }}
                            >
                              <RankingText
                                rank={summary.position}
                                variant="body1"
                              >
                                {`#${summary.position}`}
                              </RankingText>
                            </TableCell>
                            <TableCell>
                              <UserAvatar
                                user={
                                  summary
                                    ? {
                                        id: summary.userId,
                                        ...summary.userHead,
                                      }
                                    : undefined
                                }
                                size={40}
                                shape="rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <UsernameText
                                variant="body1"
                                user={
                                  summary
                                    ? {
                                        userId: summary.userId,
                                        head: summary.userHead,
                                      }
                                    : undefined
                                }
                              />
                            </TableCell>
                            <SpaceCell />
                            {activities.sort().map((type) => (
                              <TableCell key={type} align="center">
                                {formatNumber(
                                  summary.activity[
                                    type as keyof typeof summary.activity
                                  ] ?? 0,
                                )}
                              </TableCell>
                            ))}
                            <SpaceCell />
                            {[...summary.history.slice(1)]
                              .reverse()
                              .map((record, i) => (
                                <GradeCell
                                  grade={record.grade}
                                  key={`${summary.userId}-${i}`}
                                >
                                  {record.score}
                                </GradeCell>
                              ))}
                            <SpaceCell />
                            <GradeCell grade={summary.scoreGrade}>
                              {formatNumber(summary.score)}
                            </GradeCell>
                            <GradeCell grade={summary.scoreGrade}>
                              {summary.scoreGrade}
                            </GradeCell>
                            <GradeCell grade={summary.trendGrade}>
                              <TrendIcon grade={summary.trendGrade} />
                            </GradeCell>
                            <GradeCell grade={summary.trendGrade}>
                              {summary.trend}
                            </GradeCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
