import React, { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import { generateRosetteSVG } from '../utils/medal';

interface StampProps {
  children?: React.ReactNode;
  color?: string;
  size?: number;
}

export const Stamp: React.FC<StampProps> = ({ children, color, size }) => {
  const stampSize = size ?? 180;

  const svgContent = useMemo(() => {
    return generateRosetteSVG({
      size: stampSize + 32,
      outerR: stampSize / 2 + 8,
      innerR: stampSize / 2 - 8,
      biteR: 11,
      depth: 10,
      count: 16,
      bg: 'none',
      ringColor: color || 'currentColor',
    });
  }, [stampSize, color]);

  return (
    <Box
      sx={{
        position: 'relative',

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
          top: -16,
          left: -16,
          right: -16,
          bottom: -16,
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
