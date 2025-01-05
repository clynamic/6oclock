import { Theme, useTheme } from '@mui/material';

import { PerformanceGrade, TrendGrade } from '../api';

export const getScoreGradeColor = (
  theme: Theme,
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
    return theme.palette.success.main;
  } else if (grade == PerformanceGrade.B) {
    return theme.palette.success.light;
  } else if (grade == PerformanceGrade.C) {
    return theme.palette.warning.main;
  } else if (grade == PerformanceGrade.D) {
    return theme.palette.warning.light;
  } else if (grade == PerformanceGrade.E) {
    return theme.palette.error.light;
  } else if (grade == PerformanceGrade.F) {
    return theme.palette.error.main;
  }
};

export const getTrendGradeColor = (
  theme: Theme,
  grade?: TrendGrade,
): string | undefined => {
  if (!grade) return undefined;
  if (grade == TrendGrade.surge) {
    return theme.palette.success.main;
  } else if (grade == TrendGrade.climb) {
    return theme.palette.success.light;
  } else if (grade == TrendGrade.rise) {
    return theme.palette.success.light;
  } else if (grade == TrendGrade.neutral) {
    return theme.palette.warning.main;
  } else if (grade == TrendGrade.decline) {
    return theme.palette.warning.light;
  } else if (grade == TrendGrade.drop) {
    return theme.palette.error.light;
  } else if (grade == TrendGrade.plummet) {
    return theme.palette.error.main;
  }
};

export const useGradeColors = () => {
  const theme = useTheme();

  return {
    getScoreGradeColor: (grade?: PerformanceGrade) =>
      getScoreGradeColor(theme, grade),
    getTrendGradeColor: (grade?: TrendGrade) =>
      getTrendGradeColor(theme, grade),
  };
};
