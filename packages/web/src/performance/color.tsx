import { PerformanceGrade, TrendGrade } from '../api';

export const getScoreGradeColor = (
  grade?: PerformanceGrade,
): string | undefined => {
  if (!grade) return undefined;
  if (
    [PerformanceGrade.S4, PerformanceGrade.S5, PerformanceGrade.S6].some(
      (g) => g === grade,
    )
  ) {
    // return 'info.main';
    return '#9e66bb';
  } else if (
    [PerformanceGrade.S, PerformanceGrade.S2, PerformanceGrade.S3].some(
      (g) => g === grade,
    )
  ) {
    // We do not show a lighter color, because all S ranks are considered over the top already
    // return '#af81c6';
    return '#9e66bb';
    // return 'info.main';
  } else if (grade == PerformanceGrade.A) {
    return 'success.main';
  } else if (grade == PerformanceGrade.B) {
    return 'success.light';
  } else if (grade == PerformanceGrade.C) {
    return 'warning.light';
  } else if (grade == PerformanceGrade.D) {
    return 'warning.main';
  } else if (grade == PerformanceGrade.E) {
    return 'error.light';
  } else if (grade == PerformanceGrade.F) {
    return 'error.main';
  }
};

export const getTrendGradeColor = (grade?: TrendGrade): string | undefined => {
  if (!grade) return undefined;
  if (grade == TrendGrade.surge) {
    return 'success.main';
  } else if (grade == TrendGrade.climb) {
    return 'success.light';
  } else if (grade == TrendGrade.rise) {
    return 'success.light';
  } else if (grade == TrendGrade.neutral) {
    return 'warning.light';
  } else if (grade == TrendGrade.decline) {
    return 'warning.main';
  } else if (grade == TrendGrade.drop) {
    return 'error.light';
  } else if (grade == TrendGrade.plummet) {
    return 'error.main';
  }
};
