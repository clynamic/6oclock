import { format, subMonths } from 'date-fns';

import { PerformanceSummary } from '../api';
import { getActivityFromKey, getActivityNoun } from '../utils/activity';
import { getTrendSymbol } from '../utils/trends';

export const exportPerformanceToCSV = (
  data: PerformanceSummary[],
  range?: { startDate: Date; endDate: Date },
  area?: string,
): void => {
  const activeActivityTypes = new Set<string>();
  data.forEach((summary) => {
    Object.entries(summary.activity).forEach(([key, value]) => {
      if (value && value > 0) {
        activeActivityTypes.add(key);
      }
    });
  });

  const activityHeaders = Array.from(activeActivityTypes)
    .sort()
    .map((key) => {
      try {
        return getActivityNoun(getActivityFromKey(key));
      } catch {
        return key;
      }
    });

  const currentDate = range?.startDate || new Date();
  const monthHeaders = [
    subMonths(currentDate, 3),
    subMonths(currentDate, 2),
    subMonths(currentDate, 1),
  ].map((e) => format(e, 'MMMM'));

  const headers = [
    'Username',
    ...activityHeaders,
    '',
    ...monthHeaders,
    '',
    format(currentDate, 'MMMM'),
    'Grade',
    'Trend Symbol',
    'Trend Number',
  ];

  const rows = data.map((summary) => {
    const baseRow = [summary.head?.name || `User ${summary.userId}`];

    const activityRow = Array.from(activeActivityTypes)
      .sort()
      .map(
        (key) =>
          summary.activity[key as keyof typeof summary.activity]?.toString() ||
          '0',
      );

    const historicalScores = [...summary.history.slice(1, 4)]
      .reverse()
      .map((record) => record.score.toString());

    while (historicalScores.length < 3) {
      historicalScores.unshift('');
    }

    const finalRow = [
      ...baseRow,
      ...activityRow,
      '',
      ...historicalScores,
      '',
      summary.score.toString(),
      summary.scoreGrade,
      getTrendSymbol(summary.trendGrade),
      summary.trend.toString(),
    ];

    return finalRow;
  });

  const csvData = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${area || 'sheet'}-performance-${format(range?.startDate || new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};
