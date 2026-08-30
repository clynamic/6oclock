import { DateRange } from 'src/common';
import { ManifestEntity } from 'src/manifest/manifest.entity';

import { readManifestCoverage } from './manifest-health.utils';

const at = (value: string): Date => new Date(value);

const claiming = (startDate: string, endDate: string): ManifestEntity =>
  ({ startDate: at(startDate), endDate: at(endDate) }) as ManifestEntity;

const reaching = (startDate: string, endDate: string): DateRange =>
  new DateRange({ startDate: at(startDate), endDate: at(endDate) });

describe('reading what a type covers', () => {
  it('counts every manifest as a part, even where two claim one stretch', () => {
    const coverage = readManifestCoverage(
      [
        claiming('2024-03-01T00:00:00Z', '2024-03-10T00:00:00Z'),
        claiming('2024-03-05T00:00:00Z', '2024-03-15T00:00:00Z'),
      ],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    expect(coverage.parts).toBe(2);
  });

  it('joins overlapping claims, so the stretch between them is not a hole', () => {
    const coverage = readManifestCoverage(
      [
        claiming('2024-03-01T00:00:00Z', '2024-03-10T00:00:00Z'),
        claiming('2024-03-05T00:00:00Z', '2024-03-15T00:00:00Z'),
      ],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    expect(coverage.covered).toBe(14);
  });

  it('leaves an unclaimed stretch out of the days covered', () => {
    const coverage = readManifestCoverage(
      [
        claiming('2024-03-01T00:00:00Z', '2024-03-05T00:00:00Z'),
        claiming('2024-03-10T00:00:00Z', '2024-03-15T00:00:00Z'),
      ],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    expect(coverage.covered).toBe(9);
  });

  it('reports the outer edges of what the claims reach', () => {
    const coverage = readManifestCoverage(
      [
        claiming('2024-03-10T00:00:00Z', '2024-03-15T00:00:00Z'),
        claiming('2024-03-01T00:00:00Z', '2024-03-05T00:00:00Z'),
      ],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    expect(coverage.startDate).toEqual(at('2024-03-01T00:00:00Z'));
    expect(coverage.endDate).toEqual(at('2024-03-15T00:00:00Z'));
  });

  it('owes nothing anywhere when one claim covers the whole reach', () => {
    const coverage = readManifestCoverage(
      [claiming('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z')],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    expect(coverage.slices.every((slice) => slice.unavailable === 0)).toBe(
      true,
    );
  });

  it('still owes nothing when the reach divides into uneven marks', () => {
    const coverage = readManifestCoverage(
      [claiming('2024-03-01T00:00:07Z', '2024-04-11T13:41:23Z')],
      reaching('2024-03-01T00:00:07Z', '2024-04-11T13:41:23Z'),
    );

    expect(coverage.slices.every((slice) => slice.unavailable === 0)).toBe(
      true,
    );
  });

  it('owes nothing for a mark past everything the type ever held', () => {
    const coverage = readManifestCoverage(
      [claiming('2024-03-01T00:00:00Z', '2024-03-08T00:00:00Z')],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    const last = coverage.slices[coverage.slices.length - 1]!;

    expect(last.available).toBe(0);
    expect(last.unavailable).toBe(0);
    expect(last.none).toBeGreaterThan(0);
  });

  it('owes a mark that falls between two claims', () => {
    const coverage = readManifestCoverage(
      [
        claiming('2024-03-01T00:00:00Z', '2024-03-02T00:00:00Z'),
        claiming('2024-03-14T00:00:00Z', '2024-03-15T00:00:00Z'),
      ],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    const middle = coverage.slices[30]!;

    expect(middle.available).toBe(0);
    expect(middle.unavailable).toBeGreaterThan(0);
    expect(middle.none).toBe(0);
  });

  it('lays the gap counts onto the marks they belong to', () => {
    const counts = new Array<number>(60).fill(0);
    counts[3] = 7;

    const coverage = readManifestCoverage(
      [claiming('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z')],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
      counts,
    );

    expect(coverage.slices[3]!.gaps).toBe(7);
    expect(coverage.slices[4]!.gaps).toBe(0);
  });

  it('reports no gaps on any mark when none were found', () => {
    const coverage = readManifestCoverage(
      [claiming('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z')],
      reaching('2024-03-01T00:00:00Z', '2024-03-15T00:00:00Z'),
    );

    expect(coverage.slices.every((slice) => slice.gaps === 0)).toBe(true);
  });
});
