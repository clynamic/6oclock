import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import { mix } from 'polished';
import React, { PropsWithChildren, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { PerformanceGrade, TrendGrade, usePerformance } from '../api';
import {
  QueryHint,
  RankingText,
  TrendIcon,
  UserAvatar,
  UsernameText,
} from '../common';
import {
  NavLink,
  NavSpacer,
  Page,
  PageBody,
  PageFooter,
  PageHeader,
  PageTitle,
} from '../page';
import {
  DateRange,
  formatNumber,
  getActivityFromKey,
  getActivityNoun,
  refetchQueryOptions,
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const tableRef = React.useRef<HTMLTableElement>(null);

  const lastMonth = searchParams.get('lastMonth') === 'true';

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

  const { data, isLoading, error } = usePerformance(
    {
      ...selectedRange,
      area,
      head: true,
    },
    refetchQueryOptions(),
  );

  const months = useMemo(() => {
    const months = [];
    let date = DateTime.fromJSDate(selectedRange.startDate);
    for (let i = 0; i < 4; i++) {
      months.push(date.toFormat('LLLL'));
      date = date.minus({ month: 1 });
    }
    return months;
  }, [selectedRange.startDate]);

  const activities = useMemo(() => {
    const activities = new Set<string>();
    data?.forEach((summary) => {
      Object.keys(summary.activity).forEach((type) => {
        activities.add(type);
      });
    });
    return Array.from(activities);
  }, [data]);

  return (
    <Page>
      <PageTitle subtitle="Performance" />
      <PageHeader
        actions={[
          <NavSpacer />,
          <NavLink
            href={
              lastMonth
                ? location.pathname
                : `${location.pathname}?lastMonth=true`
            }
            label={lastMonth ? 'This Month' : 'Last Month'}
          />,
        ]}
      />
      <PageBody>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <QueryHint data={data} isLoading={isLoading} error={error}>
            <Table size="small" sx={{ width: 'fit-content' }} ref={tableRef}>
              <TableHead>
                <TableRow>
                  <SpaceCell />
                  <SpaceCell />
                  <TableCell>Name</TableCell>
                  <SpaceCell />
                  {activities.map((type) => (
                    <TableCell key={type}>
                      {getActivityNoun(getActivityFromKey(type))}
                    </TableCell>
                  ))}
                  <SpaceCell />
                  {[...months.slice(1)].reverse().map((month) => (
                    <TableCell key={month}>{month}</TableCell>
                  ))}
                  <SpaceCell />
                  <TableCell>{months[0]}</TableCell>
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
                      navigate(
                        `/performance/${summary.userId}${location.search}`,
                      );
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
                      <UserAvatar
                        user={
                          summary
                            ? { id: summary.userId, ...summary.userHead }
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
                    {activities.map((type) => (
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
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
