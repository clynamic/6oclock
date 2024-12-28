/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.5
 */
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
} from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { ErrorType } from '../http/axios';
import { makeRequest } from '../http/axios';
import type {
  GetPostUploaderSummaryParams,
  GetUploadCountParams,
  PostUploaderSummary,
  SeriesCountPoint,
} from './model';

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

/**
 * Get a summary of post uploading counts for a given date range
 * @summary Uploader summary
 */
export const postUploaderSummary = (
  params?: GetPostUploaderSummaryParams,
  signal?: AbortSignal,
) => {
  return makeRequest<PostUploaderSummary[]>({
    url: `/metrics/uploads/uploader/summary`,
    method: 'GET',
    params,
    signal,
  });
};

export const getPostUploaderSummaryQueryKey = (
  params?: GetPostUploaderSummaryParams,
) => {
  return [
    `/metrics/uploads/uploader/summary`,
    ...(params ? [params] : []),
  ] as const;
};

export const getPostUploaderSummaryInfiniteQueryOptions = <
  TData = InfiniteData<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    GetPostUploaderSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postUploaderSummary>>,
        QueryKey,
        GetPostUploaderSummaryParams['page']
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getPostUploaderSummaryQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    QueryKey,
    GetPostUploaderSummaryParams['page']
  > = ({ signal, pageParam }) =>
    postUploaderSummary(
      { ...params, page: pageParam || params?.['page'] },
      signal,
    );

  return { queryKey, queryFn, ...queryOptions } as UseInfiniteQueryOptions<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    TError,
    TData,
    Awaited<ReturnType<typeof postUploaderSummary>>,
    QueryKey,
    GetPostUploaderSummaryParams['page']
  > & { queryKey: QueryKey };
};

export type PostUploaderSummaryInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof postUploaderSummary>>
>;
export type PostUploaderSummaryInfiniteQueryError = ErrorType<unknown>;

export function usePostUploaderSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    GetPostUploaderSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetPostUploaderSummaryParams,
  options: {
    query: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postUploaderSummary>>,
        QueryKey,
        GetPostUploaderSummaryParams['page']
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof postUploaderSummary>>,
          TError,
          TData,
          QueryKey
        >,
        'initialData'
      >;
  },
): DefinedUseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostUploaderSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    GetPostUploaderSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postUploaderSummary>>,
        QueryKey,
        GetPostUploaderSummaryParams['page']
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof postUploaderSummary>>,
          TError,
          TData,
          QueryKey
        >,
        'initialData'
      >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostUploaderSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    GetPostUploaderSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postUploaderSummary>>,
        QueryKey,
        GetPostUploaderSummaryParams['page']
      >
    >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Uploader summary
 */

export function usePostUploaderSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    GetPostUploaderSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof postUploaderSummary>>,
        QueryKey,
        GetPostUploaderSummaryParams['page']
      >
    >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getPostUploaderSummaryInfiniteQueryOptions(
    params,
    options,
  );

  const query = useInfiniteQuery(queryOptions) as UseInfiniteQueryResult<
    TData,
    TError
  > & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const getPostUploaderSummaryQueryOptions = <
  TData = Awaited<ReturnType<typeof postUploaderSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getPostUploaderSummaryQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof postUploaderSummary>>
  > = ({ signal }) => postUploaderSummary(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof postUploaderSummary>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type PostUploaderSummaryQueryResult = NonNullable<
  Awaited<ReturnType<typeof postUploaderSummary>>
>;
export type PostUploaderSummaryQueryError = ErrorType<unknown>;

export function usePostUploaderSummary<
  TData = Awaited<ReturnType<typeof postUploaderSummary>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetPostUploaderSummaryParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof postUploaderSummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostUploaderSummary<
  TData = Awaited<ReturnType<typeof postUploaderSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof postUploaderSummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function usePostUploaderSummary<
  TData = Awaited<ReturnType<typeof postUploaderSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Uploader summary
 */

export function usePostUploaderSummary<
  TData = Awaited<ReturnType<typeof postUploaderSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetPostUploaderSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof postUploaderSummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getPostUploaderSummaryQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
