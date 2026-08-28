import { generateManifestSlices } from './manifest-health.utils';

const ids = (...values: number[]): { id: number }[] =>
  values.map((id) => ({ id }));

const shape = (
  slices: ReturnType<typeof generateManifestSlices>,
): { available: number; unavailable: number; none: number }[] =>
  slices.map(({ available, unavailable, none }) => ({
    available,
    unavailable,
    none,
  }));

describe('generateManifestSlices', () => {
  it('always draws a multiple of the base count', () => {
    expect(
      generateManifestSlices({ allIds: [], lowerId: 1, upperId: 30 }),
    ).toHaveLength(30);
  });

  it('grows the slice count in whole base counts as the range grows', () => {
    expect(
      generateManifestSlices({
        allIds: [],
        lowerId: 1,
        upperId: 400000,
        maxSize: 10000,
      }),
    ).toHaveLength(60);
  });

  it('reports every id as available when none is missing', () => {
    const slices = generateManifestSlices({
      allIds: ids(1, 2, 3, 4, 5, 6),
      lowerId: 1,
      upperId: 6,
      baseCount: 3,
      maxSize: 10000,
    });

    expect(shape(slices)).toEqual([
      { available: 2, unavailable: 0, none: 0 },
      { available: 2, unavailable: 0, none: 0 },
      { available: 2, unavailable: 0, none: 0 },
    ]);
  });

  it('reports a gap inside the covered span as unavailable', () => {
    const slices = generateManifestSlices({
      allIds: ids(1, 2, 5, 6),
      lowerId: 1,
      upperId: 6,
      baseCount: 3,
      maxSize: 10000,
    });

    expect(shape(slices)).toEqual([
      { available: 2, unavailable: 0, none: 0 },
      { available: 0, unavailable: 2, none: 0 },
      { available: 2, unavailable: 0, none: 0 },
    ]);
  });

  it('reports an entirely empty range as unavailable throughout', () => {
    const slices = generateManifestSlices({
      allIds: [],
      lowerId: 1,
      upperId: 6,
      baseCount: 3,
      maxSize: 10000,
    });

    expect(shape(slices)).toEqual([
      { available: 0, unavailable: 2, none: 0 },
      { available: 0, unavailable: 2, none: 0 },
      { available: 0, unavailable: 2, none: 0 },
    ]);
  });

  it('runs the slices end to end from the lower id to the upper one', () => {
    const slices = generateManifestSlices({
      allIds: [],
      lowerId: 100,
      upperId: 129,
      baseCount: 3,
      maxSize: 10000,
    });

    expect(slices[0]!.startId).toBe(100);
    expect(slices[slices.length - 1]!.endId).toBe(129);
    slices.slice(1).forEach((slice, index) => {
      expect(slice.startId).toBe(slices[index]!.endId + 1);
    });
  });

  it('counts each id once across the whole range', () => {
    const slices = generateManifestSlices({
      allIds: ids(1, 3, 5, 7, 9),
      lowerId: 1,
      upperId: 9,
      baseCount: 3,
      maxSize: 10000,
    });

    expect(slices.reduce((sum, slice) => sum + slice.available, 0)).toBe(5);
  });

  describe('a manifest that claims no ids', () => {
    it('draws no slices when both bounds are absent', () => {
      const slices = generateManifestSlices({
        allIds: [],
        lowerId: undefined as unknown as number,
        upperId: undefined as unknown as number,
      });

      expect(slices).toEqual([]);
    });

    it('invents a full run of missing ids when the bounds arrive as null', () => {
      const slices = generateManifestSlices({
        allIds: [],
        lowerId: null as unknown as number,
        upperId: null as unknown as number,
      });

      expect(slices).toHaveLength(30);
      expect(
        slices.reduce((sum, slice) => sum + slice.unavailable, 0),
      ).toBeGreaterThan(0);
    });
  });

  describe('characterised, not specified', () => {
    it('reports padding past the upper id as none on the final slice', () => {
      const slices = generateManifestSlices({
        allIds: ids(1, 2, 3, 4, 5, 6, 7),
        lowerId: 1,
        upperId: 7,
        baseCount: 3,
        maxSize: 10000,
      });

      expect(shape(slices)[2]).toEqual({
        available: 1,
        unavailable: 0,
        none: 2,
      });
    });
  });
});
