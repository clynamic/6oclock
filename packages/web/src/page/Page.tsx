import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

export const Page: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: {
          xs: 0.5,
          sm: 2,
        },
        paddingRight: {
          xs: 0.5,
          sm: 2,
        },
        backgroundColor: 'background.default',
        backgroundImage: `url("/assets/hex-tile.png")`,
        overflow: 'hidden',
        overflowY: 'auto',

        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: (theme) => theme.palette.secondary.main,
          borderRadius: 6,
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: (theme) => theme.palette.secondary.dark,
        },
      }}
    >
      {children}
    </Box>
  );
};
