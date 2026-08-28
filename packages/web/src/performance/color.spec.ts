import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { PerformanceGrade, TrendGrade } from '../api';
import { getScoreGradeColor, getTrendGradeColor } from './color';

const theme = createTheme();

const SCORES = Object.values(PerformanceGrade) as PerformanceGrade[];
const TRENDS = Object.values(TrendGrade) as TrendGrade[];

describe('getScoreGradeColor', () => {
  it.each(SCORES)('gives grade %s a colour to render with', (grade) => {
    expect(getScoreGradeColor(theme, grade)).toBeDefined();
  });

  it('gives no colour when there is no grade to colour', () => {
    expect(getScoreGradeColor(theme, undefined)).toBeUndefined();
  });

  it('paints a passing grade differently from a failing one', () => {
    expect(getScoreGradeColor(theme, PerformanceGrade.A)).not.toBe(
      getScoreGradeColor(theme, PerformanceGrade.F),
    );
  });

  it('paints every S rank alike, since they are all over the top', () => {
    const ranks = [
      PerformanceGrade.S,
      PerformanceGrade.S2,
      PerformanceGrade.S3,
      PerformanceGrade.S4,
      PerformanceGrade.S5,
      PerformanceGrade.S6,
    ].map((grade) => getScoreGradeColor(theme, grade));

    expect(new Set(ranks).size).toBe(1);
  });

  it('takes its colours from the theme below the S ranks', () => {
    expect(getScoreGradeColor(theme, PerformanceGrade.A)).toBe(
      theme.palette.success.main,
    );
    expect(getScoreGradeColor(theme, PerformanceGrade.F)).toBe(
      theme.palette.error.main,
    );
  });
});

describe('getTrendGradeColor', () => {
  it.each(TRENDS)('gives trend %s a colour to render with', (grade) => {
    expect(getTrendGradeColor(theme, grade)).toBeDefined();
  });

  it('gives no colour when there is no trend to colour', () => {
    expect(getTrendGradeColor(theme, undefined)).toBeUndefined();
  });

  it('paints a rise in success colours and a fall in error colours', () => {
    expect(getTrendGradeColor(theme, TrendGrade.surge)).toBe(
      theme.palette.success.main,
    );
    expect(getTrendGradeColor(theme, TrendGrade.plummet)).toBe(
      theme.palette.error.main,
    );
  });

  it('sets the steepest moves apart from the gentler ones', () => {
    expect(getTrendGradeColor(theme, TrendGrade.surge)).not.toBe(
      getTrendGradeColor(theme, TrendGrade.climb),
    );
    expect(getTrendGradeColor(theme, TrendGrade.plummet)).not.toBe(
      getTrendGradeColor(theme, TrendGrade.drop),
    );
  });

  describe('characterised, not specified', () => {
    it('paints a rise and a climb the same, unlike their arrows', () => {
      expect(getTrendGradeColor(theme, TrendGrade.rise)).toBe(
        getTrendGradeColor(theme, TrendGrade.climb),
      );
    });
  });
});
