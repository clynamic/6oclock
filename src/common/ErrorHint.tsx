import { WarningAmberOutlined } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useMemo } from 'react';

export interface ErrorHintProps {
  error?: unknown;
}

export const ErrorHint: React.FC<ErrorHintProps> = ({ error }) => {
  const message = useMemo(() => {
    if (error instanceof AxiosError) {
      if (!error.response) {
        return 'Server is offline';
      }

      const status = error.response?.status;
      const statusText = error.response?.statusText || 'Unknown Error';
      const message = error.response?.data?.message;

      let result = '';
      if (status) result += `${status}: `;
      if (message) result += message;
      else result += statusText;

      return result;
    }

    return 'Something went wrong';
  }, [error]);

  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ height: '100%' }}
    >
      <WarningAmberOutlined sx={{ fontSize: 48 }} />
      <Typography variant="h6">{message}</Typography>
    </Stack>
  );
};
