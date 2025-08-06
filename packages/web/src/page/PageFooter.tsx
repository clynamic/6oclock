import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { version } from '../../package.json';
import { AppLogo } from '../common/AppLogo';

export const PageFooter: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
        padding: 1,

        borderTopLeftRadius: (theme) => theme.shape.borderRadius,
        borderTopRightRadius: (theme) => theme.shape.borderRadius,

        backgroundColor: 'background.paper',
        userSelect: 'none',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          marginLeft: 1.2, // TODO: find a better way to balance the logo
        }}
      >
        <Typography variant="body2">beta</Typography>
        <AppLogo />
        <Typography variant="body2">{'v' + version}</Typography>
      </Stack>
    </Box>
  );
};
