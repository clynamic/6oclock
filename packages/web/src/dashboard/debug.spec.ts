import { describe, expect, it } from 'vitest';

import { DashboardUpdate } from '../api';
import { extractDashboardLayoutPositions } from './debug';

const update = (positions: unknown): DashboardUpdate =>
  ({ positions }) as DashboardUpdate;

describe('extractDashboardLayoutPositions', () => {
  it('turns the layout inside out, keying by item rather than breakpoint', () => {
    expect(
      extractDashboardLayoutPositions(
        update({ md: [{ i: 'health-jobs', x: 1, y: 2, w: 3, h: 4 }] }),
      ),
    ).toEqual({ 'health-jobs': { md: { x: 1, y: 2, w: 3, h: 4 } } });
  });

  it('gathers every breakpoint an item appears at under that item', () => {
    expect(
      extractDashboardLayoutPositions(
        update({
          xs: [{ i: 'health-jobs', x: 0, y: 0, w: 4, h: 12 }],
          md: [{ i: 'health-jobs', x: 5, y: 0, w: 4, h: 12 }],
        }),
      ),
    ).toEqual({
      'health-jobs': {
        xs: { x: 0, y: 0, w: 4, h: 12 },
        md: { x: 5, y: 0, w: 4, h: 12 },
      },
    });
  });

  it('keeps separate items apart', () => {
    const extracted = extractDashboardLayoutPositions(
      update({
        md: [
          { i: 'first', x: 0, y: 0, w: 1, h: 1 },
          { i: 'second', x: 1, y: 0, w: 1, h: 1 },
        ],
      }),
    );

    expect(Object.keys(extracted).sort()).toEqual(['first', 'second']);
  });

  it('drops the item key from the position, since it is the key now', () => {
    const extracted = extractDashboardLayoutPositions(
      update({ md: [{ i: 'health-jobs', x: 1, y: 2, w: 3, h: 4 }] }),
    );

    expect(extracted['health-jobs']!.md).not.toHaveProperty('i');
  });

  it('gives back nothing when the update carries no layout', () => {
    expect(extractDashboardLayoutPositions(update(undefined))).toEqual({});
  });

  it('gives back nothing for a layout naming no breakpoints', () => {
    expect(extractDashboardLayoutPositions(update({}))).toEqual({});
  });

  it('skips a breakpoint holding something that is not a list', () => {
    expect(
      extractDashboardLayoutPositions(
        update({
          md: [{ i: 'health-jobs', x: 1, y: 2, w: 3, h: 4 }],
          lg: 'nonsense',
        }),
      ),
    ).toEqual({ 'health-jobs': { md: { x: 1, y: 2, w: 3, h: 4 } } });
  });

  it('keeps an empty breakpoint out of the result entirely', () => {
    expect(extractDashboardLayoutPositions(update({ md: [] }))).toEqual({});
  });
});
