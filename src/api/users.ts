/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.1
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
import type { UserHead } from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Get user head by user id
 * @summary Get user head
 */
export const userHead = (id: number, signal?: AbortSignal) => {
  return makeRequest<UserHead>({
    url: `/users/head/${encodeURIComponent(String(id))}`,
    method: 'GET',
    signal,
  });
};

export const getUserHeadQueryKey = (id: number) => {
  return [`/users/head/${id}`] as const;
};

export const getUserHeadQueryOptions = <
  TData = Awaited<ReturnType<typeof userHead>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof userHead>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getUserHeadQueryKey(id);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof userHead>>> = ({
    signal,
  }) => userHead(id, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<Awaited<ReturnType<typeof userHead>>, TError, TData> & {
    queryKey: QueryKey;
  };
};

export type UserHeadQueryResult = NonNullable<
  Awaited<ReturnType<typeof userHead>>
>;
export type UserHeadQueryError = ErrorType<unknown>;

export function useUserHead<
  TData = Awaited<ReturnType<typeof userHead>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof userHead>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof userHead>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useUserHead<
  TData = Awaited<ReturnType<typeof userHead>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof userHead>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof userHead>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useUserHead<
  TData = Awaited<ReturnType<typeof userHead>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof userHead>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Get user head
 */

export function useUserHead<
  TData = Awaited<ReturnType<typeof userHead>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof userHead>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getUserHeadQueryOptions(id, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
