import React, { PropsWithChildren } from 'react';

import { Box, Stack, Typography } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: '100%',
            width: '100%',

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            borderRadius: '4px',

            textAlign: 'center',
            textShadow: '0 0 12px black',

            background: `repeating-linear-gradient(
              45deg,
              red,
              red 16px,
              transparent 16px,
              transparent 48px
            )`,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h6">{'Something went wrong :('}</Typography>
            <Typography variant="body1">
              Please inform us about this issue.
            </Typography>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
