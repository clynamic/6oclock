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
  useTheme,
} from '@mui/material';
import html2canvas from '@wtto00/html2canvas';
import { DateTime } from 'luxon';
import { mix } from 'polished';
import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { PerformanceGrade, TrendGrade, usePerformance } from '../api';
import {
  QueryHint,
  RankingText,
  TrendIcon,
  UserAvatar,
  UsernameText,
} from '../common';
import { AXIOS_INSTANCE } from '../http';
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

const ProxyImageWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const images = wrapperRef.current.querySelectorAll<HTMLImageElement>('img');

    images.forEach((image) => {
      const newSrc = image.src.replace(
        'https://static1.e621.net',
        `${AXIOS_INSTANCE.defaults.baseURL!}/proxy`,
      );

      image.setAttribute('src', newSrc);
    });
  }, []);

  return <Box ref={wrapperRef}>{children}</Box>;
};

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
    () =>
      inferDurationFromRange(
        DateTime.fromJSDate(range.startDate),
        DateTime.fromJSDate(range.endDate),
      ),
    [range.startDate, range.endDate],
  );
  const navigate = useNavigate();

  const theme = useTheme();
  const screenshotRef = React.useRef<HTMLDivElement>(null);

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
    let date = DateTime.fromJSDate(range.startDate);

    for (let i = 0; i < 4; i++) {
      switch (chartDuration) {
        case TimeDuration.Day:
          labels.push(date.toFormat('MMM dd'));
          break;
        case TimeDuration.Week:
          labels.push(date.toFormat("'W'W MMM"));
          break;
        case TimeDuration.Month:
          labels.push(date.toFormat('LLLL'));
          break;
        case TimeDuration.Year:
          labels.push(date.toFormat('yyyy'));
          break;
        default:
          labels.push(date.toFormat('LLLL'));
      }
      date = date.minus({ [durationUnit]: 1 });
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

  const handlePrint = () => {
    if (screenshotRef.current) {
      html2canvas(screenshotRef.current, {
        useCORS: true,
        backgroundColor: theme.palette.background.paper,
        onclone: (clonedDocument) => {
          clonedDocument.querySelectorAll<HTMLElement>('p').forEach((el) => {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg.includes('linear-gradient')) {
              el.style.color =
                bg
                  .match(
                    /#[0-9a-fA-F]+|rgba?\([\d\s,]+\)|hsla?\([\d\s%,]+\)/,
                  )?.[0]
                  ?.trim() || 'currentColor';
              el.style.backgroundImage = 'none';
            }
          });

          Object.assign(
            clonedDocument.getElementById('screenshot-root')!.style,
            {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: `url("/assets/hex-texture.png")`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'top left',
            },
          );
        },
      }).then((canvas) => {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${area}-performance-${DateTime.fromJSDate(
          range.startDate,
        ).toFormat('yyyy-MM-dd')}.png`;
        a.click();
      });
    }
  };

  return (
    <Page>
      <PageTitle subtitle="Performance" />
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
              ref={screenshotRef}
              id="screenshot-root"
              sx={{
                p: 2,
                width: 'fit-content',
              }}
            >
              <Typography variant="h6">
                {formatRangeLabel(
                  DateTime.fromJSDate(range.startDate),
                  DateTime.fromJSDate(range.endDate),
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
                        <RankingText rank={summary.position} variant="body1">
                          {`#${summary.position}`}
                        </RankingText>
                      </TableCell>
                      <TableCell>
                        <ProxyImageWrapper>
                          <UserAvatar
                            user={
                              summary
                                ? { id: summary.userId, ...summary.userHead }
                                : undefined
                            }
                            size={40}
                            shape="rounded"
                          />
                        </ProxyImageWrapper>
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
      <PageFooter />
    </Page>
  );
};
