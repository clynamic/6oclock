/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.3
 */
import { useQuery } from '@tanstack/react-query';
import type {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import type {
  GetDeletionActivitySummaryByDeleterParams,
  GetDeletionActivitySummaryParams,
  GetDeletionSeriesByUserParams,
  GetDeletionSeriesParams,
  SeriesCountPoint,
} from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Get total post deletion counts for a given date range
 * @summary Post deletion activity summary
 */
export const deletionActivitySummary = (
  params?: GetDeletionActivitySummaryParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/flags/metric/deletion/activity/summary`,
    method: 'GET',
    params,
    signal,
  });
};

export const getDeletionActivitySummaryQueryKey = (
  params?: GetDeletionActivitySummaryParams,
) => {
  return [
    `/flags/metric/deletion/activity/summary`,
    ...(params ? [params] : []),
  ] as const;
};

export const getDeletionActivitySummaryQueryOptions = <
  TData = Awaited<ReturnType<typeof deletionActivitySummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionActivitySummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummary>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getDeletionActivitySummaryQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof deletionActivitySummary>>
  > = ({ signal }) => deletionActivitySummary(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof deletionActivitySummary>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type DeletionActivitySummaryQueryResult = NonNullable<
  Awaited<ReturnType<typeof deletionActivitySummary>>
>;
export type DeletionActivitySummaryQueryError = ErrorType<unknown>;

export function useDeletionActivitySummary<
  TData = Awaited<ReturnType<typeof deletionActivitySummary>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetDeletionActivitySummaryParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummary>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionActivitySummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionActivitySummary<
  TData = Awaited<ReturnType<typeof deletionActivitySummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionActivitySummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummary>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionActivitySummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionActivitySummary<
  TData = Awaited<ReturnType<typeof deletionActivitySummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionActivitySummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Post deletion activity summary
 */

export function useDeletionActivitySummary<
  TData = Awaited<ReturnType<typeof deletionActivitySummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionActivitySummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getDeletionActivitySummaryQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get total post deletion counts for a given date range by deleter
 * @summary Post deletion activity summary by deleter
 */
export const deletionActivitySummaryByDeleter = (
  userId: number,
  params?: GetDeletionActivitySummaryByDeleterParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/flags/metric/deletion/activity/summary/${encodeURIComponent(String(userId))}`,
    method: 'GET',
    params,
    signal,
  });
};

export const getDeletionActivitySummaryByDeleterQueryKey = (
  userId: number,
  params?: GetDeletionActivitySummaryByDeleterParams,
) => {
  return [
    `/flags/metric/deletion/activity/summary/${userId}`,
    ...(params ? [params] : []),
  ] as const;
};

export const getDeletionActivitySummaryByDeleterQueryOptions = <
  TData = Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionActivitySummaryByDeleterParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ??
    getDeletionActivitySummaryByDeleterQueryKey(userId, params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>
  > = ({ signal }) => deletionActivitySummaryByDeleter(userId, params, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!userId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type DeletionActivitySummaryByDeleterQueryResult = NonNullable<
  Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>
>;
export type DeletionActivitySummaryByDeleterQueryError = ErrorType<unknown>;

export function useDeletionActivitySummaryByDeleter<
  TData = Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params: undefined | GetDeletionActivitySummaryByDeleterParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionActivitySummaryByDeleter<
  TData = Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionActivitySummaryByDeleterParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionActivitySummaryByDeleter<
  TData = Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionActivitySummaryByDeleterParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Post deletion activity summary by deleter
 */

export function useDeletionActivitySummaryByDeleter<
  TData = Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionActivitySummaryByDeleterParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionActivitySummaryByDeleter>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getDeletionActivitySummaryByDeleterQueryOptions(
    userId,
    params,
    options,
  );

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a time series of post deletion counts for a given date range
 * @summary Post deletion series
 */
export const deletionSeries = (
  params?: GetDeletionSeriesParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/flags/metric/deletion/series`,
    method: 'GET',
    params,
    signal,
  });
};

export const getDeletionSeriesQueryKey = (params?: GetDeletionSeriesParams) => {
  return [
    `/flags/metric/deletion/series`,
    ...(params ? [params] : []),
  ] as const;
};

export const getDeletionSeriesQueryOptions = <
  TData = Awaited<ReturnType<typeof deletionSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof deletionSeries>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getDeletionSeriesQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof deletionSeries>>> = ({
    signal,
  }) => deletionSeries(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof deletionSeries>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type DeletionSeriesQueryResult = NonNullable<
  Awaited<ReturnType<typeof deletionSeries>>
>;
export type DeletionSeriesQueryError = ErrorType<unknown>;

export function useDeletionSeries<
  TData = Awaited<ReturnType<typeof deletionSeries>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetDeletionSeriesParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof deletionSeries>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionSeries>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionSeries<
  TData = Awaited<ReturnType<typeof deletionSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof deletionSeries>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionSeries>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionSeries<
  TData = Awaited<ReturnType<typeof deletionSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof deletionSeries>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Post deletion series
 */

export function useDeletionSeries<
  TData = Awaited<ReturnType<typeof deletionSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetDeletionSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof deletionSeries>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getDeletionSeriesQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a time series of post deletion counts for a given date range by user
 * @summary Post deletion series by user
 */
export const deletionSeriesByUser = (
  userId: number,
  params?: GetDeletionSeriesByUserParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/flags/metric/deletion/series/${encodeURIComponent(String(userId))}`,
    method: 'GET',
    params,
    signal,
  });
};

export const getDeletionSeriesByUserQueryKey = (
  userId: number,
  params?: GetDeletionSeriesByUserParams,
) => {
  return [
    `/flags/metric/deletion/series/${userId}`,
    ...(params ? [params] : []),
  ] as const;
};

export const getDeletionSeriesByUserQueryOptions = <
  TData = Awaited<ReturnType<typeof deletionSeriesByUser>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionSeriesByUserParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionSeriesByUser>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getDeletionSeriesByUserQueryKey(userId, params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof deletionSeriesByUser>>
  > = ({ signal }) => deletionSeriesByUser(userId, params, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!userId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof deletionSeriesByUser>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type DeletionSeriesByUserQueryResult = NonNullable<
  Awaited<ReturnType<typeof deletionSeriesByUser>>
>;
export type DeletionSeriesByUserQueryError = ErrorType<unknown>;

export function useDeletionSeriesByUser<
  TData = Awaited<ReturnType<typeof deletionSeriesByUser>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params: undefined | GetDeletionSeriesByUserParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionSeriesByUser>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionSeriesByUser>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionSeriesByUser<
  TData = Awaited<ReturnType<typeof deletionSeriesByUser>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionSeriesByUserParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionSeriesByUser>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof deletionSeriesByUser>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useDeletionSeriesByUser<
  TData = Awaited<ReturnType<typeof deletionSeriesByUser>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionSeriesByUserParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionSeriesByUser>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Post deletion series by user
 */

export function useDeletionSeriesByUser<
  TData = Awaited<ReturnType<typeof deletionSeriesByUser>>,
  TError = ErrorType<unknown>,
>(
  userId: number,
  params?: GetDeletionSeriesByUserParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof deletionSeriesByUser>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getDeletionSeriesByUserQueryOptions(
    userId,
    params,
    options,
  );

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
