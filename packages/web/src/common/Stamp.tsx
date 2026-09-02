import React, { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import { generateRosetteSVG } from '../utils/medal';

interface StampProps {
  children?: React.ReactNode;
  color?: string;
  size?: number;
}

const REFERENCE_SIZE = 90;

export const Stamp: React.FC<StampProps> = ({ children, color, size }) => {
  const stampSize = size ?? 180;
  const scale = stampSize / REFERENCE_SIZE;
  const bleed = 16 * scale;

  const svgContent = useMemo(() => {
    return generateRosetteSVG({
      id: `stamp-${stampSize}-${(color ?? 'current').replace(/[^a-z0-9]/gi, '')}`,
      size: stampSize + bleed * 2,
      outerR: stampSize / 2 + 8 * scale,
      innerR: stampSize / 2 - 8 * scale,
      biteR: 11 * scale,
      depth: 10 * scale,
      count: 16,
      bg: 'none',
      ringColor: color || 'currentColor',
    });
  }, [stampSize, scale, bleed, color]);

  return (
    <Box
      sx={{
        position: 'relative',
        flexShrink: 0,

        width: stampSize,
        aspectRatio: 1,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -bleed,
          left: -bleed,
          right: -bleed,
          bottom: -bleed,
          aspectRatio: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <Typography
        sx={{
          color: color,
          lineHeight: '100%',
          fontSize: stampSize / 3,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};
