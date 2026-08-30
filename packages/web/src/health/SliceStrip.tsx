import { Box, Skeleton, Tooltip } from '@mui/material';

export interface Slice {
  startDate: Date;
  endDate: Date;
  available: number;
  unavailable: number;
  none: number;
  gaps?: number;
}

export interface SliceStripProps {
  slices?: Slice[];

  /** A porous source has holes upstream, so a gap is absence rather than loss. */
  porous?: boolean;

  height?: number;

  label?: (slice: Slice, index: number) => string;
}

export const sliceState = (slice: Slice): string => {
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

/**
 * One mark per slice, lit by what that slice holds.
 *
 * Reads like the lights on a rack, where the shape of the run carries the
 * meaning rather than any single mark. Costs one element per slice.
 */
export const SliceStrip: React.FC<SliceStripProps> = ({
  slices,
  porous = false,
  height = 12,
  label,
}) => {
  if (!slices) {
    return <Skeleton variant="rectangular" height={height} />;
  }

  return (
    <Box sx={{ display: 'flex', gap: '1px', height, width: '100%' }}>
      {slices.map((slice, index) => {
        const mark = (
          <Box
            sx={{
              flex: 1,
              minWidth: '2px',
              borderRadius: '1px',
              backgroundColor: sliceColor(slice, porous),
            }}
          />
        );

        return label ? (
          <Tooltip key={index} title={label(slice, index)} disableInteractive>
            {mark}
          </Tooltip>
        ) : (
          <Box key={index} sx={{ display: 'contents' }}>
            {mark}
          </Box>
        );
      })}
    </Box>
  );
};
