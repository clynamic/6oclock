import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePerformance } from '../api';
import {
  QueryHint,
  RankingText,
  TrendIcon,
  UserAvatar,
  UsernameText,
} from '../common';
import { Page, PageBody, PageFooter, PageHeader, PageTitle } from '../page';
import { getScoreGradeColor, getTrendGradeColor } from '../users';
import {
  DateRange,
  formatNumber,
  getActivityFromKey,
  getActivityNoun,
  refetchQueryOptions,
  useChartValue,
} from '../utils';

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

export const PerformanceTable: React.FC = () => {
  const { range, area } = useChartValue();
  const navigate = useNavigate();
  const tableRef = React.useRef<HTMLTableElement>(null);

  const lastMonth = true;

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
      <PageHeader />
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
                        <TableCell
                          align="center"
                          sx={{
                            backgroundColor: getScoreGradeColor(record.grade),
                          }}
                          key={`${summary.userId}-${i}`}
                        >
                          {record.score}
                        </TableCell>
                      ))}
                    <SpaceCell />
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: getScoreGradeColor(summary.scoreGrade),
                      }}
                    >
                      {formatNumber(summary.score)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: getScoreGradeColor(summary.scoreGrade),
                      }}
                    >
                      {summary.scoreGrade}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: getTrendGradeColor(summary.trendGrade),
                      }}
                    >
                      <TrendIcon grade={summary.trendGrade} />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: getTrendGradeColor(summary.trendGrade),
                      }}
                    >
                      {summary.trend}
                    </TableCell>
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
