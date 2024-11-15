import { CircularProgress, Stack, Typography } from '@mui/material';

export interface LoadingHintProps {
  message?: React.ReactNode;
}

export const LoadingHint: React.FC<LoadingHintProps> = ({ message }) => {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ height: '100%' }}
    >
      <CircularProgress size={48} />
      {message && <Typography variant="h6">{message}</Typography>}
    </Stack>
  );
};
