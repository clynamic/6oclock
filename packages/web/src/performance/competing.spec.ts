import { describe, expect, it } from 'vitest';

import { PerformanceGrade, PerformanceSummary } from '../api';
import { filterCompeting } from './competing';

const withGrade = (
  userId: number,
  scoreGrade: PerformanceGrade,
): PerformanceSummary =>
  ({ userId, scoreGrade }) as unknown as PerformanceSummary;

describe('filterCompeting', () => {
  it('drops the inactive tail and keeps the order of the rest', () => {
    const data = [
      withGrade(1, PerformanceGrade.S),
      withGrade(2, PerformanceGrade.A),
      withGrade(3, PerformanceGrade.E),
      withGrade(4, PerformanceGrade.F),
    ];

    expect(filterCompeting(data)?.map((s) => s.userId)).toEqual([1, 2]);
  });

  it('passes an unloaded board through', () => {
    expect(filterCompeting(undefined)).toBeUndefined();
  });
});
