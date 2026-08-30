import { DateRange } from 'src/common';
import { ManifestEntity } from 'src/manifest/manifest.entity';

import { ManifestSlice } from './manifest-health.dto';

export const SLICE_COUNT = 60;

const DAY = 24 * 60 * 60 * 1000;

export interface ManifestCoverage {
  parts: number;
  startDate: Date;
  endDate: Date;
  covered: number;
  reach: number;
  slices: ManifestSlice[];
}

export const readManifestCoverage = (
  manifests: ManifestEntity[],
  reach: DateRange,
  gaps: number[] = [],
): ManifestCoverage => {
  const ranges = manifests
    .map((manifest) => ({
      start: manifest.startDate.getTime(),
      end: manifest.endDate.getTime(),
    }))
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];

  for (const range of ranges) {
    const last = merged[merged.length - 1];

    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  const reachStart = reach.startDate.getTime();
  const reachEnd = reach.endDate.getTime();
  const width = (reachEnd - reachStart) / SLICE_COUNT;

  // The reach spans every type, so a mark can fall outside the span this type
  // has ever held. That time is owed to nobody, which `none` carries and
  // `unavailable` would report as a hole.
  const spanStart = merged[0]?.start ?? reachStart;
  const spanEnd = merged[merged.length - 1]?.end ?? reachStart;

  const slices = Array.from({ length: SLICE_COUNT }, (_, index) => {
    const start = reachStart + index * width;
    const end = start + width;

    const available = merged.reduce(
      (sum, range) =>
        sum +
        Math.max(0, Math.min(end, range.end) - Math.max(start, range.start)),
      0,
    );

    const owed = Math.max(
      0,
      Math.min(end, spanEnd) - Math.max(start, spanStart),
    );

    return new ManifestSlice({
      startDate: new Date(start),
      endDate: new Date(end),
      available: Math.round(available),
      unavailable: Math.max(0, Math.round(owed - available)),
      none: Math.max(0, Math.round(width - owed)),
      gaps: gaps[index] ?? 0,
    });
  });

  return {
    parts: manifests.length,
    startDate: new Date(merged[0]?.start ?? reachStart),
    endDate: new Date(merged[merged.length - 1]?.end ?? reachStart),
    covered:
      merged.reduce((sum, range) => sum + (range.end - range.start), 0) / DAY,
    reach: (reachEnd - reachStart) / DAY,
    slices,
  };
};
