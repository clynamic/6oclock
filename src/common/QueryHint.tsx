import { Box, CircularProgress } from '@mui/material';
import { PropsWithChildren, useMemo } from 'react';

import { BarChartSkeleton } from './BarChartSkeleton';
import { ErrorHint } from './ErrorHint';
import { PieChartSkeleton } from './PieChartSkeleton';

export interface QueryHintProps {
  type?: QuerySkeletonType;
  isLoading?: boolean | boolean[];
  loadMode?: 'all' | 'any';
  error?: unknown | unknown[];
}

export type QuerySkeletonType = 'default' | 'bars' | 'lines' | 'pie';

export const QueryHint: React.FC<PropsWithChildren<QueryHintProps>> = ({
  type = 'default',
  isLoading: loading = false,
  loadMode = 'all',
  error = null,
  children,
}) => {
  const errors = useMemo(() => {
    if (Array.isArray(error)) {
      return error.filter((e) => e);
    }
    return error ? [error] : [];
  }, [error]);

  const isLoading = useMemo(() => {
    return Array.isArray(loading)
      ? loadMode === 'all'
        ? loading.every((l) => l)
        : loading.some((l) => l)
      : loading;
  }, [loading, loadMode]);

  if (errors.length) {
    return <ErrorHint error={errors} />;
  }

  if (isLoading) {
    switch (type) {
      case 'bars':
        return <BarChartSkeleton />;
      case 'pie':
        return <PieChartSkeleton />;
      default:
        return (
          <Box
            p={4}
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        );
    }
  }

  return <>{children}</>;
};
