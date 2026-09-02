import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { PerformanceGrade, TrendGrade } from '../api';
import { getScoreGradeColor, getTrendGradeColor } from './color';

const theme = createTheme();

const SCORES = Object.values(PerformanceGrade) as PerformanceGrade[];
const TRENDS = Object.values(TrendGrade) as TrendGrade[];

describe('getScoreGradeColor', () => {
  it.each(SCORES)('gives grade %s a colour to render with', (grade) => {
    expect(getScoreGradeColor(grade)).toBeDefined();
  });

  it('gives no colour when there is no grade to colour', () => {
    expect(getScoreGradeColor(undefined)).toBeUndefined();
  });
});

describe('getTrendGradeColor', () => {
  it.each(TRENDS)('gives trend %s a colour to render with', (grade) => {
    expect(getTrendGradeColor(theme, grade)).toBeDefined();
  });

  it('gives no colour when there is no trend to colour', () => {
    expect(getTrendGradeColor(theme, undefined)).toBeUndefined();
  });
});
