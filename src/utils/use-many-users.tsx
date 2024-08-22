import {
  InfiniteData,
  keepPreviousData,
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import _ from "lodash";
import { useCallback, useMemo } from "react";

import { getUserQueryKey, getUsersQueryKey, User, users } from "../api";

const USER_ID_BATCH_SIZE = 100;

export interface UseManyUsersConfig {
  query?: Partial<
    UseInfiniteQueryOptions<
      User[],
      Error | null,
      InfiniteData<User[], number | undefined>,
      User[],
      QueryKey,
      number | undefined
    >
  >;
}

export const useManyUsers = (
  userIds?: number[],
  config?: UseManyUsersConfig
) => {
  const queryClient = useQueryClient();

  const ids = useMemo(() => Array.from(new Set(userIds)).sort(), [userIds]);
  const batches = useMemo(() => _.chunk(ids, USER_ID_BATCH_SIZE), [ids]);

  const params = useMemo(() => ({ "search[id]": ids?.join(",") }), [ids]);

  const fetchUsersBatch = useCallback(
    async ({
      pageParam = 0,
    }: QueryFunctionContext<QueryKey, number | undefined>) => {
      const batch = batches[pageParam];
      if (!batch) return [];
      const result = await users(params);

      result.forEach((user) => {
        queryClient.setQueryData(getUserQueryKey(user.id.toString()), user);
      });

      return result;
    },
    [batches, params, queryClient]
  );

  const queryOptions: UseInfiniteQueryOptions<
    User[],
    Error | null,
    InfiniteData<User[], number | undefined>,
    User[],
    QueryKey,
    number | undefined
  > = useMemo(
    () => ({
      queryFn: fetchUsersBatch,
      queryKey: getUsersQueryKey(params),
      initialPageParam: 0,
      getNextPageParam: (_, pages) => {
        const nextBatchIndex = pages.length;
        return nextBatchIndex < batches.length ? nextBatchIndex : undefined;
      },
      enabled: ids.length > 0,
      placeholderData: keepPreviousData,
      ...config?.query,
    }),
    [fetchUsersBatch, params, ids.length, config?.query, batches.length]
  );

  return useInfiniteQuery(queryOptions);
};
