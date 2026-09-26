import { PerformanceSummary } from '../api';
import { describeAction } from '../utils/activity';

const ACTIVITY_FLOOR = 0.05;

export const notableActivities = (summary: PerformanceSummary) => {
  const counts = Object.entries(summary.activity)
    .map(([key, count]) => ({
      key,
      label: describeAction(key),
      count,
      score: summary.activityScores[key] ?? 0,
    }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.score - a.score);
  const floor = (counts[0]?.score ?? 0) * ACTIVITY_FLOOR;
  return counts.filter(({ score }) => score >= floor);
};
