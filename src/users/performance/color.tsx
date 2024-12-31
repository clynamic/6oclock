import { PerformanceGrade } from '../../api';

export const getScoreGradeColor = (
  grade?: PerformanceGrade,
): string | undefined => {
  if (!grade) return undefined;
  if (
    [
      PerformanceGrade.S,
      PerformanceGrade.S2,
      PerformanceGrade.S3,
      PerformanceGrade.S4,
      PerformanceGrade.S5,
      PerformanceGrade.S6,
    ].some((g) => g === grade)
  ) {
    return 'success.main';
  } else if (grade == PerformanceGrade.A) {
    return 'success.light';
  } else if (grade == PerformanceGrade.B) {
    return 'warning.light';
  } else if (grade == PerformanceGrade.C) {
    return 'warning.main';
  } else if (grade == PerformanceGrade.D) {
    return 'error.light';
  } else if (grade == PerformanceGrade.E) {
    return 'error.main';
  } else if (grade == PerformanceGrade.F) {
    return 'error.dark';
  }
};
