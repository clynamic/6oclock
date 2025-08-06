import React from 'react';

import { Box, Typography } from '@mui/material';

interface StampProps {
  children?: React.ReactNode;
  color?: string;
  size?: number;
}

export const Stamp: React.FC<StampProps> = ({ children, color, size }) => {
  return (
    <Box
      sx={{
        position: 'relative',

        width: size ?? '180px',
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
          '--g':
            '/calc(16.324% + 4.103px) calc(16.324% + 4.103px) radial-gradient(#0000 calc(70% - 5px),#000 calc(71% - 5px) 70%,#0000 71%) no-repeat',
          mask: 'radial-gradient(100% 100%,#000 calc((16.324% + 4.103px)/0.398 - 12.568px),#0000 calc((16.324% + 4.103px)/0.398 - 12.568px + 1px)) intersect,100% 50% var(--g),96.194% 69.134% var(--g),85.355% 85.355% var(--g),69.134% 96.194% var(--g),50% 100% var(--g),30.866% 96.194% var(--g),14.645% 85.355% var(--g),3.806% 69.134% var(--g),0% 50% var(--g),3.806% 30.866% var(--g),14.645% 14.645% var(--g),30.866% 3.806% var(--g),50% 0% var(--g),69.134% 3.806% var(--g),85.355% 14.645% var(--g),96.194% 30.866% var(--g)',
          backgroundColor: color,
        }}
      />
      <Typography
        sx={{
          color: color,
          lineHeight: '100%',
          fontSize: size ? size / 3 : '60px',
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};
