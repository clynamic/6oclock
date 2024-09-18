import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const AppLogo = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="text"
      color="secondary"
      size="small"
      onClick={() => navigate('/')}
      sx={{
        textTransform: 'none',
        color: 'text.primary',
        width: '64px',
        height: '64px',
      }}
    >
      <Box component={'img'} src="/assets/6oclock.svg" alt="logo" height={48} />
    </Button>
  );
};
