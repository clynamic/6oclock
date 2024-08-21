/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * e621 API
 * An API for accessing user information and other resources on e621 and e926.
 * OpenAPI spec version: 1.0.0
 */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type {
  DefinedInitialDataOptions,
  DefinedUseInfiniteQueryResult,
  DefinedUseQueryResult,
  InfiniteData,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type { Approval, GetPostApprovalsParams } from "./model";
import { makeRequest } from "../http/axios";
import type { ErrorType } from "../http/axios";

/**
 * Returns a list of post approvals based on search criteria.
 * @summary Get a list of post approvals
 */
export const postApprovals = (
  params?: GetPostApprovalsParams,
  signal?: AbortSignal,
) => {
  return makeRequest<Approval[]>({
    url: `/post_approvals.json`,
    method: "GET",
    params,
    signal,
  });
};

export const getPostApprovalsQueryKey = (params?: GetPostApprovalsParams) => {
  return [`/post_approvals.json`, ...(params ? [params] : [])] as const;
};

export const getPostApprovalsInfiniteQueryOptions = <
  TData = InfiniteData<
    Awaited<ReturnType<typeof postApprovals>>,
    GetPostApprovalsParams["page"]
  >,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postApprovals>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postApprovals>>,
        QueryKey,
        GetPostApprovalsParams["page"]
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPostApprovalsQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof postApprovals>>,
    QueryKey,
    GetPostApprovalsParams["page"]
  > = ({ signal, pageParam }) =>
    postApprovals({ ...params, page: pageParam || params?.["page"] }, signal);

  return { queryKey, queryFn, ...queryOptions } as UseInfiniteQueryOptions<
    Awaited<ReturnType<typeof postApprovals>>,
    TError,
    TData,
    Awaited<ReturnType<typeof postApprovals>>,
    QueryKey,
    GetPostApprovalsParams["page"]
  > & { queryKey: QueryKey };
};

export type PostApprovalsInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof postApprovals>>
>;
export type PostApprovalsInfiniteQueryError = ErrorType<void>;

export function usePostApprovalsInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postApprovals>>,
    GetPostApprovalsParams["page"]
  >,
  TError = ErrorType<void>,
>(
  params: undefined | GetPostApprovalsParams,
  options: {
    query: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postApprovals>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postApprovals>>,
        QueryKey,
        GetPostApprovalsParams["page"]
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof postApprovals>>,
          TError,
          TData,
          QueryKey
        >,
        "initialData"
      >;
  },
): DefinedUseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostApprovalsInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postApprovals>>,
    GetPostApprovalsParams["page"]
  >,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postApprovals>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postApprovals>>,
        QueryKey,
        GetPostApprovalsParams["page"]
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof postApprovals>>,
          TError,
          TData,
          QueryKey
        >,
        "initialData"
      >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostApprovalsInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postApprovals>>,
    GetPostApprovalsParams["page"]
  >,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postApprovals>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postApprovals>>,
        QueryKey,
        GetPostApprovalsParams["page"]
      >
    >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Get a list of post approvals
 */

export function usePostApprovalsInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postApprovals>>,
    GetPostApprovalsParams["page"]
  >,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postApprovals>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postApprovals>>,
        QueryKey,
        GetPostApprovalsParams["page"]
      >
    >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getPostApprovalsInfiniteQueryOptions(params, options);

  const query = useInfiniteQuery(queryOptions) as UseInfiniteQueryResult<
    TData,
    TError
  > & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const getPostApprovalsQueryOptions = <
  TData = Awaited<ReturnType<typeof postApprovals>>,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof postApprovals>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPostApprovalsQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof postApprovals>>> = ({
    signal,
  }) => postApprovals(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof postApprovals>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type PostApprovalsQueryResult = NonNullable<
  Awaited<ReturnType<typeof postApprovals>>
>;
export type PostApprovalsQueryError = ErrorType<void>;

export function usePostApprovals<
  TData = Awaited<ReturnType<typeof postApprovals>>,
  TError = ErrorType<void>,
>(
  params: undefined | GetPostApprovalsParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof postApprovals>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof postApprovals>>,
          TError,
          TData
        >,
        "initialData"
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostApprovals<
  TData = Awaited<ReturnType<typeof postApprovals>>,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof postApprovals>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof postApprovals>>,
          TError,
          TData
        >,
        "initialData"
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostApprovals<
  TData = Awaited<ReturnType<typeof postApprovals>>,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof postApprovals>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Get a list of post approvals
 */

export function usePostApprovals<
  TData = Awaited<ReturnType<typeof postApprovals>>,
  TError = ErrorType<void>,
>(
  params?: GetPostApprovalsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof postApprovals>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getPostApprovalsQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
