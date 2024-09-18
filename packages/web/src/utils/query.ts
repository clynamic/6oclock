import { UseQueryOptions } from '@tanstack/react-query';

export const refetchQueryOptions = <T>(
  partial?: Partial<UseQueryOptions<T>>,
): {
  query: Partial<UseQueryOptions<T>>;
} => {
  return {
    query: {
      ...partial,
      refetchInterval: 1000 * 60 * 5,
    },
  };
};
