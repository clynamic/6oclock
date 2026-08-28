import { describe, expect, it } from 'vitest';

import { TrendGrade } from '../api';
import { getTrendSymbol } from './trends';

describe('getTrendSymbol', () => {
  it.each(['rise', 'climb', 'surge'] as TrendGrade[])(
    'points %s upward',
    (grade) => {
      expect(getTrendSymbol(grade)).toMatch(/^↗+$/);
    },
  );

  it.each(['decline', 'drop', 'plummet'] as TrendGrade[])(
    'points %s downward',
    (grade) => {
      expect(getTrendSymbol(grade)).toMatch(/^↘+$/);
    },
  );

  it('points a neutral trend flat', () => {
    expect(getTrendSymbol('neutral' as TrendGrade)).toBe('→');
  });

  it('says how strong a rise is by repeating the arrow', () => {
    expect(getTrendSymbol('rise' as TrendGrade)).toHaveLength(1);
    expect(getTrendSymbol('climb' as TrendGrade)).toHaveLength(2);
    expect(getTrendSymbol('surge' as TrendGrade)).toHaveLength(3);
  });

  it('says how steep a fall is the same way', () => {
    expect(getTrendSymbol('decline' as TrendGrade)).toHaveLength(1);
    expect(getTrendSymbol('drop' as TrendGrade)).toHaveLength(2);
    expect(getTrendSymbol('plummet' as TrendGrade)).toHaveLength(3);
  });

  it('mirrors each rise with a fall of matching weight', () => {
    const rises = ['rise', 'climb', 'surge'] as TrendGrade[];
    const falls = ['decline', 'drop', 'plummet'] as TrendGrade[];

    rises.forEach((rise, index) => {
      expect(getTrendSymbol(rise)).toHaveLength(
        getTrendSymbol(falls[index]).length,
      );
    });
  });
});
