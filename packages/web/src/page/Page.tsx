import { PropsWithChildren, useState } from 'react';

import { Box } from '@mui/material';

import { PageScrollContext } from './PageScrollContext';

export const Page: React.FC<PropsWithChildren> = ({ children }) => {
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);

  return (
    <PageScrollContext.Provider value={scrollParent}>
      <Box
        ref={setScrollParent}
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
    </PageScrollContext.Provider>
  );
};
