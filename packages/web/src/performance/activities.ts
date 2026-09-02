import { PerformanceSummary } from '../api';
import { describeAction } from '../utils/activity';

const ACTIVITY_FLOOR = 0.05;

export const notableActivities = (summary: PerformanceSummary) => {
  const counts = Object.entries(summary.activity)
    .map(([key, count]) => ({
      key,
      label: describeAction(key),
      count,
    }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
  const floor = (counts[0]?.count ?? 0) * ACTIVITY_FLOOR;
  return counts.filter(({ count }) => count >= floor);
};
