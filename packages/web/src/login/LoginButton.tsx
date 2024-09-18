import { ArrowForward } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import React from 'react';

export interface LoginButtonProps {
  loading: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ loading }) => {
  return (
    <LoadingButton
      variant="contained"
      endIcon={<ArrowForward />}
      type="submit"
      loading={loading}
      sx={{
        '& .MuiButton-endIcon': {
          transition: 'transform 0.3s ease-in-out',
        },
        '&:hover .MuiButton-endIcon': {
          transform: 'translateX(4px)',
        },
      }}
    >
      Log In
    </LoadingButton>
  );
};
