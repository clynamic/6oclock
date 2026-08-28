import { generateTileSlices } from './tile-health.utils';

const at = (iso: string): Date => new Date(iso);

const missing = (...isos: string[]): { time: Date }[] =>
  isos.map((iso) => ({ time: at(iso) }));

const shape = (
  slices: ReturnType<typeof generateTileSlices>,
): { available: number; unavailable: number; none: number }[] =>
  slices.map(({ available, unavailable, none }) => ({
    available,
    unavailable,
    none,
  }));

describe('generateTileSlices', () => {
  it('gives one slice per hour when the window is smaller than the ceiling', () => {
    const slices = generateTileSlices({
      missingTimes: [],
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-01-01T04:00:00Z'),
    });

    expect(slices).toHaveLength(4);
    expect(shape(slices)).toEqual([
      { available: 1, unavailable: 0, none: 0 },
      { available: 1, unavailable: 0, none: 0 },
      { available: 1, unavailable: 0, none: 0 },
      { available: 1, unavailable: 0, none: 0 },
    ]);
  });

  it('never draws more slices than the ceiling allows', () => {
    const slices = generateTileSlices({
      missingTimes: [],
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-03-01T00:00:00Z'),
    });

    expect(slices).toHaveLength(30);
  });

  it('counts a missing hour as unavailable in the slice holding it', () => {
    const slices = generateTileSlices({
      missingTimes: missing('2024-01-01T02:00:00Z'),
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-01-01T04:00:00Z'),
    });

    expect(shape(slices)).toEqual([
      { available: 1, unavailable: 0, none: 0 },
      { available: 1, unavailable: 0, none: 0 },
      { available: 0, unavailable: 1, none: 0 },
      { available: 1, unavailable: 0, none: 0 },
    ]);
  });

  it('counts every missing hour of a slice that holds several', () => {
    const slices = generateTileSlices({
      missingTimes: missing(
        '2024-01-01T00:00:00Z',
        '2024-01-01T01:00:00Z',
        '2024-01-01T02:00:00Z',
        '2024-01-01T03:00:00Z',
      ),
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-01-01T08:00:00Z'),
      maxSlices: 2,
    });

    expect(shape(slices)).toEqual([
      { available: 0, unavailable: 4, none: 0 },
      { available: 4, unavailable: 0, none: 0 },
    ]);
  });

  it('runs the slices end to end from the start to the end of the window', () => {
    const slices = generateTileSlices({
      missingTimes: [],
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-01-02T00:00:00Z'),
      maxSlices: 5,
    });

    expect(slices[0]!.startDate).toEqual(at('2024-01-01T00:00:00Z'));
    expect(slices[slices.length - 1]!.endDate).toEqual(
      at('2024-01-02T00:00:00Z'),
    );
    slices.slice(1).forEach((slice, index) => {
      expect(slice.startDate).toEqual(slices[index]!.endDate);
    });
  });

  it('groups hours together when the interval is longer than one', () => {
    const slices = generateTileSlices({
      missingTimes: [],
      startDate: at('2024-01-01T00:00:00Z'),
      endDate: at('2024-01-01T12:00:00Z'),
      intervalHours: 6,
    });

    expect(slices).toHaveLength(2);
  });

  describe('characterised, not specified', () => {
    it('reports padding as none on the short final slice', () => {
      const slices = generateTileSlices({
        missingTimes: [],
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-01T07:00:00Z'),
        maxSlices: 3,
      });

      expect(shape(slices)).toEqual([
        { available: 3, unavailable: 0, none: 0 },
        { available: 3, unavailable: 0, none: 0 },
        { available: 1, unavailable: 0, none: 2 },
      ]);
    });

    it('drops a missing hour that falls before the window without a trace', () => {
      const slices = generateTileSlices({
        missingTimes: missing('2023-12-31T22:00:00Z', '2024-01-01T02:00:00Z'),
        startDate: at('2024-01-01T00:00:00Z'),
        endDate: at('2024-01-01T04:00:00Z'),
      });

      expect(slices.reduce((sum, slice) => sum + slice.unavailable, 0)).toBe(1);
    });
  });
});
