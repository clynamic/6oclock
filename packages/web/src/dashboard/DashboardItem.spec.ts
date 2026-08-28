import { describe, expect, it } from 'vitest';

import {
  DashboardCatalog,
  breakpoints,
  buildCatalogLayout,
  buildCatalogLayouts,
  createLayout,
  createSimpleLayout,
} from './DashboardItem';

const catalogOf = (
  layouts: Record<string, Record<string, unknown>>,
): DashboardCatalog =>
  Object.fromEntries(
    Object.entries(layouts).map(([key, layout]) => [
      key,
      { name: key, layout, component: () => null },
    ]),
  ) as DashboardCatalog;

describe('createLayout', () => {
  it('gives every breakpoint a layout, even ones nobody described', () => {
    const layout = createLayout(
      { minH: 8 },
      { xs: { x: 0, y: 0, w: 4, h: 12 } },
    );

    expect(Object.keys(layout).sort()).toEqual([...breakpoints].sort());
  });

  it('carries the shared constraints onto each breakpoint', () => {
    const layout = createLayout({ minH: 8, maxH: 20 }, {});

    expect(layout.lg).toEqual({ minH: 8, maxH: 20 });
  });

  it('lets a breakpoint override a shared constraint', () => {
    const layout = createLayout(
      { minH: 8 },
      { xs: { x: 0, y: 0, w: 4, h: 12, minH: 2 } },
    );

    expect(layout.xs.minH).toBe(2);
    expect(layout.lg.minH).toBe(8);
  });
});

describe('createSimpleLayout', () => {
  it('repeats the layout it was given across every breakpoint', () => {
    const base = { x: 0, y: 0, w: 4, h: 12 };
    const layout = createSimpleLayout(base);

    for (const breakpoint of breakpoints) {
      expect(layout[breakpoint]).toEqual(base);
    }
  });

  it('lets a single breakpoint differ from the rest', () => {
    const layout = createSimpleLayout(
      { x: 0, y: 0, w: 4, h: 12 },
      { xl: { x: 0, y: 0, w: 8, h: 12 } },
    );

    expect(layout.xl.w).toBe(8);
    expect(layout.md.w).toBe(4);
  });
});

describe('buildCatalogLayout', () => {
  it('stamps the catalog key on each item, so a saved position finds it again', () => {
    const layout = buildCatalogLayout(
      catalogOf({ 'health-jobs': { md: { x: 1, y: 2, w: 3, h: 4 } } }),
      'md',
    );

    expect(layout[0]).toEqual({ i: 'health-jobs', x: 1, y: 2, w: 3, h: 4 });
  });

  it('leaves out an item that says nothing about this breakpoint', () => {
    const layout = buildCatalogLayout(
      catalogOf({ 'health-jobs': { md: { x: 1, y: 2, w: 3, h: 4 } } }),
      'xs',
    );

    expect(layout).toEqual([]);
  });

  it('keeps every item that does describe the breakpoint', () => {
    const layout = buildCatalogLayout(
      catalogOf({
        first: { md: { x: 0, y: 0, w: 1, h: 1 } },
        second: { md: { x: 1, y: 0, w: 1, h: 1 } },
      }),
      'md',
    );

    expect(layout.map((item) => item.i)).toEqual(['first', 'second']);
  });

  it('gives back nothing for an empty catalog', () => {
    expect(buildCatalogLayout({}, 'md')).toEqual([]);
  });
});

describe('buildCatalogLayouts', () => {
  it('covers every breakpoint the grid can ask for', () => {
    const layouts = buildCatalogLayouts(
      catalogOf({ 'health-jobs': createLayout({}, {}) as never }),
    );

    expect(Object.keys(layouts).sort()).toEqual([...breakpoints].sort());
  });

  it('places an item only where its layout says it goes', () => {
    const layouts = buildCatalogLayouts(
      catalogOf({ 'health-jobs': { md: { x: 1, y: 2, w: 3, h: 4 } } }),
    );

    expect(layouts.md).toHaveLength(1);
    expect(layouts.xs).toEqual([]);
  });
});
