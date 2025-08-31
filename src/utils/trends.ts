import { TrendGrade } from '../api';

export const getTrendSymbol = (grade: TrendGrade): string => {
  const getBaseSymbol = (grade: TrendGrade): string => {
    if (grade === 'rise' || grade === 'climb' || grade === 'surge') {
      return '↗';
    }
    if (grade === 'plummet' || grade === 'drop' || grade === 'decline') {
      return '↘';
    }
    return '→';
  };

  const iconMap = {
    plummet: 3,
    drop: 2,
    decline: 1,
    neutral: 1,
    rise: 1,
    climb: 2,
    surge: 3,
  };

  const baseSymbol = getBaseSymbol(grade);
  const count = iconMap[grade];

  return baseSymbol.repeat(count);
};
