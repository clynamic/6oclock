import { describe, expect, it } from 'vitest';

import { refetchQueryOptions } from './query';

const FIVE_MINUTES = 1000 * 60 * 5;

describe('refetchQueryOptions', () => {
  it('polls every five minutes, so a dashboard left open stays current', () => {
    expect(refetchQueryOptions().query.refetchInterval).toBe(FIVE_MINUTES);
  });

  it('nests the options where the generated client expects them', () => {
    expect(Object.keys(refetchQueryOptions())).toEqual(['query']);
  });

  it('carries the caller options through beside the interval', () => {
    expect(refetchQueryOptions({ enabled: false }).query.enabled).toBe(false);
  });

  it('keeps polling even when a caller asks for a different interval', () => {
    expect(
      refetchQueryOptions({ refetchInterval: 1000 }).query.refetchInterval,
    ).toBe(FIVE_MINUTES);
  });

  it('polls when given nothing at all', () => {
    expect(refetchQueryOptions(undefined).query.refetchInterval).toBe(
      FIVE_MINUTES,
    );
  });
});
