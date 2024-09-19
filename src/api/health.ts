/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.2
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
import type { ManifestHealth } from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Check the health of the application
 * @summary Health Check
 */
export const healthCheck = (signal?: AbortSignal) => {
  return makeRequest<void>({ url: `/health`, method: 'GET', signal });
};

export const getHealthCheckQueryKey = () => {
  return [`/health`] as const;
};

export const getHealthCheckQueryOptions = <
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>
  >;
}) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({
    signal,
  }) => healthCheck(signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type HealthCheckQueryResult = NonNullable<
  Awaited<ReturnType<typeof healthCheck>>
>;
export type HealthCheckQueryError = ErrorType<unknown>;

export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options: {
  query: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>
  > &
    Pick<
      DefinedInitialDataOptions<
        Awaited<ReturnType<typeof healthCheck>>,
        TError,
        TData
      >,
      'initialData'
    >;
}): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>
  > &
    Pick<
      UndefinedInitialDataOptions<
        Awaited<ReturnType<typeof healthCheck>>,
        TError,
        TData
      >,
      'initialData'
    >;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>
  >;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Health Check
 */

export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>
  >;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Retrieve manifest health
 * @summary Retrieve manifest health
 */
export const manifestHealth = (signal?: AbortSignal) => {
  return makeRequest<ManifestHealth[]>({
    url: `/health/manifests`,
    method: 'GET',
    signal,
  });
};

export const getManifestHealthQueryKey = () => {
  return [`/health/manifests`] as const;
};

export const getManifestHealthQueryOptions = <
  TData = Awaited<ReturnType<typeof manifestHealth>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof manifestHealth>>, TError, TData>
  >;
}) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getManifestHealthQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof manifestHealth>>> = ({
    signal,
  }) => manifestHealth(signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof manifestHealth>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ManifestHealthQueryResult = NonNullable<
  Awaited<ReturnType<typeof manifestHealth>>
>;
export type ManifestHealthQueryError = ErrorType<unknown>;

export function useManifestHealth<
  TData = Awaited<ReturnType<typeof manifestHealth>>,
  TError = ErrorType<unknown>,
>(options: {
  query: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof manifestHealth>>, TError, TData>
  > &
    Pick<
      DefinedInitialDataOptions<
        Awaited<ReturnType<typeof manifestHealth>>,
        TError,
        TData
      >,
      'initialData'
    >;
}): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useManifestHealth<
  TData = Awaited<ReturnType<typeof manifestHealth>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof manifestHealth>>, TError, TData>
  > &
    Pick<
      UndefinedInitialDataOptions<
        Awaited<ReturnType<typeof manifestHealth>>,
        TError,
        TData
      >,
      'initialData'
    >;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useManifestHealth<
  TData = Awaited<ReturnType<typeof manifestHealth>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof manifestHealth>>, TError, TData>
  >;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Retrieve manifest health
 */

export function useManifestHealth<
  TData = Awaited<ReturnType<typeof manifestHealth>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof manifestHealth>>, TError, TData>
  >;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getManifestHealthQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
