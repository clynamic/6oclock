import { PropsWithChildren, useMemo } from 'react';

import { BarChartSkeleton } from './BarChartSkeleton';
import { ErrorHint } from './ErrorHint';
import { LoadingHint } from './LoadingHint';
import { PieChartSkeleton } from './PieChartSkeleton';

export interface QueryHintProps {
  type?: QuerySkeletonType;
  skeleton?: React.ReactNode;
  isLoading?: boolean | boolean[];
  loadMode?: 'all' | 'any';
  error?: unknown | unknown[];
}

export type QuerySkeletonType = 'default' | 'bars' | 'lines' | 'pie';

export const QueryHint: React.FC<PropsWithChildren<QueryHintProps>> = ({
  type = 'default',
  skeleton,
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
    return <ErrorHint error={errors.find((e) => e)} />;
  }

  if (isLoading) {
    if (skeleton) {
      return skeleton;
    }

    switch (type) {
      case 'bars':
        return <BarChartSkeleton />;
      case 'pie':
        return <PieChartSkeleton />;
      default:
        return <LoadingHint />;
    }
  }

  return <>{children}</>;
};
