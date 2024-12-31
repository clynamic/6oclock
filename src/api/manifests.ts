/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * 5-thirty
 * backend data aggregate for 6 o'clock
 * OpenAPI spec version: 0.0.6
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import type { ListManifestsParams, Manifest } from './model';
import { makeRequest } from '../http/axios';
import type { ErrorType } from '../http/axios';

/**
 * Get a manifest by ID
 * @summary Get a manifest by ID
 */
export const manifest = (id: number, signal?: AbortSignal) => {
  return makeRequest<Manifest>({
    url: `/manifests/${encodeURIComponent(String(id))}`,
    method: 'GET',
    signal,
  });
};

export const getManifestQueryKey = (id: number) => {
  return [`/manifests/${id}`] as const;
};

export const getManifestQueryOptions = <
  TData = Awaited<ReturnType<typeof manifest>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof manifest>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getManifestQueryKey(id);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof manifest>>> = ({
    signal,
  }) => manifest(id, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<Awaited<ReturnType<typeof manifest>>, TError, TData> & {
    queryKey: QueryKey;
  };
};

export type ManifestQueryResult = NonNullable<
  Awaited<ReturnType<typeof manifest>>
>;
export type ManifestQueryError = ErrorType<unknown>;

export function useManifest<
  TData = Awaited<ReturnType<typeof manifest>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof manifest>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof manifest>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useManifest<
  TData = Awaited<ReturnType<typeof manifest>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof manifest>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof manifest>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useManifest<
  TData = Awaited<ReturnType<typeof manifest>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof manifest>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary Get a manifest by ID
 */

export function useManifest<
  TData = Awaited<ReturnType<typeof manifest>>,
  TError = ErrorType<unknown>,
>(
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof manifest>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getManifestQueryOptions(id, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Delete a manifest by ID
 * @summary Delete a manifest by ID
 */
export const deleteManifest = (id: number) => {
  return makeRequest<void>({
    url: `/manifests/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  });
};

export const getDeleteManifestMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteManifest>>,
    TError,
    { id: number },
    TContext
  >;
}): UseMutationOptions<
  Awaited<ReturnType<typeof deleteManifest>>,
  TError,
  { id: number },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deleteManifest>>,
    { id: number }
  > = (props) => {
    const { id } = props ?? {};

    return deleteManifest(id);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeleteManifestMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteManifest>>
>;

export type DeleteManifestMutationError = ErrorType<unknown>;

/**
 * @summary Delete a manifest by ID
 */
export const useDeleteManifest = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteManifest>>,
    TError,
    { id: number },
    TContext
  >;
}): UseMutationResult<
  Awaited<ReturnType<typeof deleteManifest>>,
  TError,
  { id: number },
  TContext
> => {
  const mutationOptions = getDeleteManifestMutationOptions(options);

  return useMutation(mutationOptions);
};
/**
 * List manifests
 * @summary List manifests
 */
export const listManifests = (
  params: ListManifestsParams,
  signal?: AbortSignal,
) => {
  return makeRequest<Manifest[]>({
    url: `/manifests`,
    method: 'GET',
    params,
    signal,
  });
};

export const getListManifestsQueryKey = (params: ListManifestsParams) => {
  return [`/manifests`, ...(params ? [params] : [])] as const;
};

export const getListManifestsQueryOptions = <
  TData = Awaited<ReturnType<typeof listManifests>>,
  TError = ErrorType<unknown>,
>(
  params: ListManifestsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof listManifests>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getListManifestsQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof listManifests>>> = ({
    signal,
  }) => listManifests(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof listManifests>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListManifestsQueryResult = NonNullable<
  Awaited<ReturnType<typeof listManifests>>
>;
export type ListManifestsQueryError = ErrorType<unknown>;

export function useListManifests<
  TData = Awaited<ReturnType<typeof listManifests>>,
  TError = ErrorType<unknown>,
>(
  params: ListManifestsParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof listManifests>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listManifests>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useListManifests<
  TData = Awaited<ReturnType<typeof listManifests>>,
  TError = ErrorType<unknown>,
>(
  params: ListManifestsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof listManifests>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listManifests>>,
          TError,
          TData
        >,
        'initialData'
      >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useListManifests<
  TData = Awaited<ReturnType<typeof listManifests>>,
  TError = ErrorType<unknown>,
>(
  params: ListManifestsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof listManifests>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
/**
 * @summary List manifests
 */

export function useListManifests<
  TData = Awaited<ReturnType<typeof listManifests>>,
  TError = ErrorType<unknown>,
>(
  params: ListManifestsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof listManifests>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListManifestsQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
