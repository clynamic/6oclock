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
  ApprovalCountSummary,
  ApproverSummary,
  GetApprovalCountSeriesByApproverParams,
  GetApprovalCountSeriesParams,
  GetApprovalCountSummaryParams,
  GetApproverSummaryParams,
  SeriesCountPoint,
} from './model';

/**
 * Get total approval counts for a given date range
 * @summary Approval count summary
 */
export const approvalCountSummary = (
  params?: GetApprovalCountSummaryParams,
  signal?: AbortSignal,
) => {
  return makeRequest<ApprovalCountSummary>({
    url: `/metrics/approvals/count/summary`,
    method: 'GET',
    params,
    signal,
  });
};

export const getApprovalCountSummaryQueryKey = (
  params?: GetApprovalCountSummaryParams,
) => {
  return [
    `/metrics/approvals/count/summary`,
    ...(params ? [params] : []),
  ] as const;
};

export const getApprovalCountSummaryQueryOptions = <
  TData = Awaited<ReturnType<typeof approvalCountSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSummary>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getApprovalCountSummaryQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof approvalCountSummary>>
  > = ({ signal }) => approvalCountSummary(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof approvalCountSummary>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ApprovalCountSummaryQueryResult = NonNullable<
  Awaited<ReturnType<typeof approvalCountSummary>>
>;
export type ApprovalCountSummaryQueryError = ErrorType<unknown>;

export function useApprovalCountSummary<
  TData = Awaited<ReturnType<typeof approvalCountSummary>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetApprovalCountSummaryParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSummary>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof approvalCountSummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApprovalCountSummary<
  TData = Awaited<ReturnType<typeof approvalCountSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSummary>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof approvalCountSummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApprovalCountSummary<
  TData = Awaited<ReturnType<typeof approvalCountSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Approval count summary
 */

export function useApprovalCountSummary<
  TData = Awaited<ReturnType<typeof approvalCountSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getApprovalCountSummaryQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a time series of approval counts for a given date range
 * @summary Approval count series
 */
export const approvalCountSeries = (
  params?: GetApprovalCountSeriesParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/metrics/approvals/count/series`,
    method: 'GET',
    params,
    signal,
  });
};

export const getApprovalCountSeriesQueryKey = (
  params?: GetApprovalCountSeriesParams,
) => {
  return [
    `/metrics/approvals/count/series`,
    ...(params ? [params] : []),
  ] as const;
};

export const getApprovalCountSeriesQueryOptions = <
  TData = Awaited<ReturnType<typeof approvalCountSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeries>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getApprovalCountSeriesQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof approvalCountSeries>>
  > = ({ signal }) => approvalCountSeries(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof approvalCountSeries>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ApprovalCountSeriesQueryResult = NonNullable<
  Awaited<ReturnType<typeof approvalCountSeries>>
>;
export type ApprovalCountSeriesQueryError = ErrorType<unknown>;

export function useApprovalCountSeries<
  TData = Awaited<ReturnType<typeof approvalCountSeries>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetApprovalCountSeriesParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeries>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof approvalCountSeries>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApprovalCountSeries<
  TData = Awaited<ReturnType<typeof approvalCountSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeries>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof approvalCountSeries>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApprovalCountSeries<
  TData = Awaited<ReturnType<typeof approvalCountSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeries>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Approval count series
 */

export function useApprovalCountSeries<
  TData = Awaited<ReturnType<typeof approvalCountSeries>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApprovalCountSeriesParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeries>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getApprovalCountSeriesQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a time series of approval counts for a given date range by approver
 * @summary Approval count series by approver
 */
export const approvalCountSeriesByApprover = (
  approverId: number,
  params?: GetApprovalCountSeriesByApproverParams,
  signal?: AbortSignal,
) => {
  return makeRequest<SeriesCountPoint[]>({
    url: `/metrics/approvals/count/series/by/approver/${encodeURIComponent(String(approverId))}`,
    method: 'GET',
    params,
    signal,
  });
};

export const getApprovalCountSeriesByApproverQueryKey = (
  approverId: number,
  params?: GetApprovalCountSeriesByApproverParams,
) => {
  return [
    `/metrics/approvals/count/series/by/approver/${approverId}`,
    ...(params ? [params] : []),
  ] as const;
};

export const getApprovalCountSeriesByApproverQueryOptions = <
  TData = Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
  TError = ErrorType<unknown>,
>(
  approverId: number,
  params?: GetApprovalCountSeriesByApproverParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ??
    getApprovalCountSeriesByApproverQueryKey(approverId, params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof approvalCountSeriesByApprover>>
  > = ({ signal }) => approvalCountSeriesByApprover(approverId, params, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!approverId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ApprovalCountSeriesByApproverQueryResult = NonNullable<
  Awaited<ReturnType<typeof approvalCountSeriesByApprover>>
>;
export type ApprovalCountSeriesByApproverQueryError = ErrorType<unknown>;

export function useApprovalCountSeriesByApprover<
  TData = Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
  TError = ErrorType<unknown>,
>(
  approverId: number,
  params: undefined | GetApprovalCountSeriesByApproverParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApprovalCountSeriesByApprover<
  TData = Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
  TError = ErrorType<unknown>,
>(
  approverId: number,
  params?: GetApprovalCountSeriesByApproverParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApprovalCountSeriesByApprover<
  TData = Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
  TError = ErrorType<unknown>,
>(
  approverId: number,
  params?: GetApprovalCountSeriesByApproverParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Approval count series by approver
 */

export function useApprovalCountSeriesByApprover<
  TData = Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
  TError = ErrorType<unknown>,
>(
  approverId: number,
  params?: GetApprovalCountSeriesByApproverParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approvalCountSeriesByApprover>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getApprovalCountSeriesByApproverQueryOptions(
    approverId,
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
 * Get a summary of approvals by approver for a given date range
 * @summary Approver summary
 */
export const approverSummary = (
  params?: GetApproverSummaryParams,
  signal?: AbortSignal,
) => {
  return makeRequest<ApproverSummary[]>({
    url: `/metrics/approvals/approver/summary`,
    method: 'GET',
    params,
    signal,
  });
};

export const getApproverSummaryQueryKey = (
  params?: GetApproverSummaryParams,
) => {
  return [
    `/metrics/approvals/approver/summary`,
    ...(params ? [params] : []),
  ] as const;
};

export const getApproverSummaryInfiniteQueryOptions = <
  TData = InfiniteData<
    Awaited<ReturnType<typeof approverSummary>>,
    GetApproverSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof approverSummary>>,
        QueryKey,
        GetApproverSummaryParams['page']
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getApproverSummaryQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof approverSummary>>,
    QueryKey,
    GetApproverSummaryParams['page']
  > = ({ signal, pageParam }) =>
    approverSummary({ ...params, page: pageParam || params?.['page'] }, signal);

  return { queryKey, queryFn, ...queryOptions } as UseInfiniteQueryOptions<
    Awaited<ReturnType<typeof approverSummary>>,
    TError,
    TData,
    Awaited<ReturnType<typeof approverSummary>>,
    QueryKey,
    GetApproverSummaryParams['page']
  > & { queryKey: QueryKey };
};

export type ApproverSummaryInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof approverSummary>>
>;
export type ApproverSummaryInfiniteQueryError = ErrorType<unknown>;

export function useApproverSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof approverSummary>>,
    GetApproverSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetApproverSummaryParams,
  options: {
    query: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof approverSummary>>,
        QueryKey,
        GetApproverSummaryParams['page']
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof approverSummary>>,
          TError,
          TData,
          QueryKey
        >,
        'initialData'
      >;
  },
): DefinedUseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApproverSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof approverSummary>>,
    GetApproverSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof approverSummary>>,
        QueryKey,
        GetApproverSummaryParams['page']
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof approverSummary>>,
          TError,
          TData,
          QueryKey
        >,
        'initialData'
      >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApproverSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof approverSummary>>,
    GetApproverSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof approverSummary>>,
        QueryKey,
        GetApproverSummaryParams['page']
      >
    >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Approver summary
 */

export function useApproverSummaryInfinite<
  TData = InfiniteData<
    Awaited<ReturnType<typeof approverSummary>>,
    GetApproverSummaryParams['page']
  >,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData,
        Awaited<ReturnType<typeof approverSummary>>,
        QueryKey,
        GetApproverSummaryParams['page']
      >
    >;
  },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getApproverSummaryInfiniteQueryOptions(params, options);

  const query = useInfiniteQuery(queryOptions) as UseInfiniteQueryResult<
    TData,
    TError
  > & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const getApproverSummaryQueryOptions = <
  TData = Awaited<ReturnType<typeof approverSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData
      >
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getApproverSummaryQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof approverSummary>>> = ({
    signal,
  }) => approverSummary(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof approverSummary>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ApproverSummaryQueryResult = NonNullable<
  Awaited<ReturnType<typeof approverSummary>>
>;
export type ApproverSummaryQueryError = ErrorType<unknown>;

export function useApproverSummary<
  TData = Awaited<ReturnType<typeof approverSummary>>,
  TError = ErrorType<unknown>,
>(
  params: undefined | GetApproverSummaryParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof approverSummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApproverSummary<
  TData = Awaited<ReturnType<typeof approverSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof approverSummary>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useApproverSummary<
  TData = Awaited<ReturnType<typeof approverSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Approver summary
 */

export function useApproverSummary<
  TData = Awaited<ReturnType<typeof approverSummary>>,
  TError = ErrorType<unknown>,
>(
  params?: GetApproverSummaryParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof approverSummary>>,
        TError,
        TData
      >
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getApproverSummaryQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
