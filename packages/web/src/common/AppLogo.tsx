import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export const AppLogo = () => {
  return (
    <Button
      variant="text"
      color="secondary"
      size="small"
      component={Link}
      to="/"
      sx={{
        textTransform: 'none',
        color: 'text.primary',
        width: '64px',
        height: '64px',
      }}
    >
      <Box
        component={'img'}
        src="/assets/6oclock.svg"
        alt="6oclock logo"
        height={48}
      />
    </Button>
  );
};
