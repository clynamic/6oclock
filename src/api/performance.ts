/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.5
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
import type { ActivitySeriesPoint, GetActivitySeriesParams } from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Get activity series for a given date range
 * @summary Activity Series
 */
export const activitySeries = (
  params?: GetActivitySeriesParams,
  signal?: AbortSignal,
) => {
  return makeRequest<ActivitySeriesPoint[]>({
    url: `/metrics/performance/activity`,
    method: 'GET',
    params,
    signal,
  });
};

export const getActivitySeriesQueryKey = (params?: GetActivitySeriesParams) => {
  return [
    `/metrics/performance/activity`,
    ...(params ? [params] : []),
  ] as const;
};

export const getActivitySeriesQueryOptions = <
  TData = Awaited<ReturnType<typeof activitySeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetActivitySeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activitySeries>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getActivitySeriesQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof activitySeries>>> = ({
    signal,
  }) => activitySeries(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof activitySeries>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ActivitySeriesQueryResult = NonNullable<
  Awaited<ReturnType<typeof activitySeries>>
>;
export type ActivitySeriesQueryError = ErrorType<unknown>;

export function useActivitySeries<
  TData = Awaited<ReturnType<typeof activitySeries>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetActivitySeriesParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activitySeries>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof activitySeries>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useActivitySeries<
  TData = Awaited<ReturnType<typeof activitySeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetActivitySeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activitySeries>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof activitySeries>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useActivitySeries<
  TData = Awaited<ReturnType<typeof activitySeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetActivitySeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activitySeries>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Activity Series
 */

export function useActivitySeries<
  TData = Awaited<ReturnType<typeof activitySeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetActivitySeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activitySeries>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getActivitySeriesQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
