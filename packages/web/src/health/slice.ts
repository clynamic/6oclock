export interface Slice {
  startDate: Date;
  endDate: Date;
  available: number;
  unavailable: number;
  none: number;
  gaps?: number;
}

export const sliceState = (slice: Slice): string => {
  if (slice.available === 0 && slice.unavailable === 0) return 'no data';
  if (slice.unavailable > 0) return 'unclaimed';
  if (!slice.gaps) return 'complete';

  return `${slice.gaps.toLocaleString()} id${slice.gaps === 1 ? '' : 's'} missing`;
};

export const sliceColor = (slice: Slice, porous: boolean): string => {
  const total = slice.available + slice.unavailable + slice.none;

  if (total === 0 || (slice.available === 0 && slice.unavailable === 0)) {
    return 'action.disabledBackground';
  }

  if (slice.unavailable > 0) {
    if (porous) return 'success.light';
    if (slice.available === 0) return 'error.main';
    return slice.unavailable / total > 0.1 ? 'error.main' : 'warning.main';
  }

  if (slice.gaps) return porous ? 'success.light' : 'error.main';

  return 'success.main';
};
