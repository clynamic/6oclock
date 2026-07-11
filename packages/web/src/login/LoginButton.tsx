import React from 'react';

import { ArrowForward } from '@mui/icons-material';
import { Button } from '@mui/material';

export interface LoginButtonProps {
  loading: boolean;
  onClick: () => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  loading,
  onClick,
}) => {
  return (
    <Button
      variant="contained"
      endIcon={<ArrowForward />}
      type="button"
      loading={loading}
      onClick={onClick}
      sx={{
        '& .MuiButton-endIcon': {
          transition: 'transform 0.3s ease-in-out',
        },
        '&:hover .MuiButton-endIcon': {
          transform: 'translateX(4px)',
        },
      }}
    >
      Log in with e621
    </Button>
  );
};
