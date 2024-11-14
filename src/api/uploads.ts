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
import type { GetUploadCountParams, SeriesCountPoint } from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Get a time series of upload counts for a given date range
 * @summary Upload series
 */
export const uploadCount = (
  params?: GetUploadCountParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/metrics/uploads/count`,
    method: 'GET',
    params,
    signal,
  });
};

export const getUploadCountQueryKey = (params?: GetUploadCountParams) => {
  return [`/metrics/uploads/count`, ...(params ? [params] : [])] as const;
};

export const getUploadCountQueryOptions = <
  TData = Awaited<ReturnType<typeof uploadCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetUploadCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof uploadCount>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getUploadCountQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof uploadCount>>> = ({
    signal,
  }) => uploadCount(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof uploadCount>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type UploadCountQueryResult = NonNullable<
  Awaited<ReturnType<typeof uploadCount>>
>;
export type UploadCountQueryError = ErrorType<unknown>;

export function useUploadCount<
  TData = Awaited<ReturnType<typeof uploadCount>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetUploadCountParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof uploadCount>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof uploadCount>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useUploadCount<
  TData = Awaited<ReturnType<typeof uploadCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetUploadCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof uploadCount>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof uploadCount>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useUploadCount<
  TData = Awaited<ReturnType<typeof uploadCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetUploadCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof uploadCount>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Upload series
 */

export function useUploadCount<
  TData = Awaited<ReturnType<typeof uploadCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetUploadCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof uploadCount>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getUploadCountQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
