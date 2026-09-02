import { Theme, useTheme } from '@mui/material';

import { PerformanceGrade, TrendGrade } from '../api';

const SCORE_GRADE_COLORS: Record<PerformanceGrade, string> = {
  [PerformanceGrade.F]: '#78828f',
  [PerformanceGrade.E]: '#c9803a',
  [PerformanceGrade.D]: '#a8adb5',
  [PerformanceGrade.C]: '#c9a22c',
  [PerformanceGrade.B]: '#3fb8b0',
  [PerformanceGrade.A]: '#5aa6e6',
  [PerformanceGrade.S]: '#9e66bb',
  [PerformanceGrade.S2]: '#9e66bb',
  [PerformanceGrade.S3]: '#cf3d49',
  [PerformanceGrade.S4]: '#cf3d49',
  [PerformanceGrade.S5]: '#cf3d49',
  [PerformanceGrade.S6]: '#cf3d49',
};

export const getScoreGradeColor = (
  grade?: PerformanceGrade,
): string | undefined => {
  if (!grade) return undefined;
  return SCORE_GRADE_COLORS[grade];
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
    getScoreGradeColor,
    getTrendGradeColor: (grade?: TrendGrade) =>
      getTrendGradeColor(theme, grade),
  };
};
