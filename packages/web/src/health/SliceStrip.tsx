import { Box, Skeleton, Tooltip } from '@mui/material';

import { Slice, sliceColor } from './slice';

export interface SliceStripProps {
  slices?: Slice[];

  /** A porous source has holes upstream, so a gap is absence rather than loss. */
  porous?: boolean;

  height?: number;

  label?: (slice: Slice, index: number) => string;
}

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
