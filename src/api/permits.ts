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
import type { GetPermitCountParams, SeriesCountPoint } from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Get total permit counts for a given date range
 * @summary Get total permit counts for a given date range
 */
export const permitCount = (
  params?: GetPermitCountParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/metrics/permits/count`,
    method: 'GET',
    params,
    signal,
  });
};

export const getPermitCountQueryKey = (params?: GetPermitCountParams) => {
  return [`/metrics/permits/count`, ...(params ? [params] : [])] as const;
};

export const getPermitCountQueryOptions = <
  TData = Awaited<ReturnType<typeof permitCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPermitCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof permitCount>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPermitCountQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof permitCount>>> = ({
    signal,
  }) => permitCount(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof permitCount>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type PermitCountQueryResult = NonNullable<
  Awaited<ReturnType<typeof permitCount>>
>;
export type PermitCountQueryError = ErrorType<unknown>;

export function usePermitCount<
  TData = Awaited<ReturnType<typeof permitCount>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetPermitCountParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof permitCount>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof permitCount>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePermitCount<
  TData = Awaited<ReturnType<typeof permitCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPermitCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof permitCount>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof permitCount>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePermitCount<
  TData = Awaited<ReturnType<typeof permitCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPermitCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof permitCount>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Get total permit counts for a given date range
 */

export function usePermitCount<
  TData = Awaited<ReturnType<typeof permitCount>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPermitCountParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof permitCount>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getPermitCountQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
