import { PerformanceGrade, PerformanceSummary } from '../api';

const INACTIVE_GRADES: ReadonlySet<PerformanceGrade> = new Set([
  PerformanceGrade.F,
  PerformanceGrade.E,
]);

export const isCompeting = (summary: PerformanceSummary): boolean =>
  !INACTIVE_GRADES.has(summary.scoreGrade);

export const filterCompeting = (
  data: PerformanceSummary[] | undefined,
): PerformanceSummary[] | undefined => data?.filter(isCompeting);
