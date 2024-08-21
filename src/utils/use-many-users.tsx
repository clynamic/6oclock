import { useCallback, useMemo } from "react";
import { GetUsersParams, getUsersQueryKey, User, users } from "../api";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
  QueryFunctionContext,
  QueryKey,
  keepPreviousData,
} from "@tanstack/react-query";
import { splitIntoBatches } from "./batches";

const USER_ID_BATCH_SIZE = 100;

export interface UseManyUsersConfig {
  params?: GetUsersParams;
  options?: UseInfiniteQueryOptions<
    User[],
    Error | null,
    InfiniteData<User[], number | undefined>,
    User[],
    QueryKey,
    number | undefined
  >;
}

export const useManyUsers = (
  userIds?: number[],
  config?: UseManyUsersConfig
) => {
  const batches = useMemo(
    () =>
      splitIntoBatches(Array.from(new Set(userIds)).sort(), USER_ID_BATCH_SIZE),
    [userIds]
  );

  const queryKey = getUsersQueryKey({
    ...config?.params,
    // this is not a real query and could never be executed.
    // thats fine because infinite queries will use the page key internally
    "search[id]": userIds?.join(","),
  });

  const fetchUsersBatch = useCallback(
    async ({
      pageParam = 0,
    }: QueryFunctionContext<QueryKey, number | undefined>) => {
      const batch = batches[pageParam];
      if (!batch) return [];
      return await users({
        ...config?.params,
        "search[id]": batch.join(","),
      });
    },
    [batches, config?.params]
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
      queryKey,
      initialPageParam: 0,
      getNextPageParam: (_, pages) => {
        const nextBatchIndex = pages.length;
        return nextBatchIndex < batches.length ? nextBatchIndex : undefined;
      },
      enabled: !!userIds && userIds.length > 0,
      placeholderData: keepPreviousData,
      ...config?.options,
    }),
    [batches.length, config?.options, fetchUsersBatch, userIds, queryKey]
  );

  return useInfiniteQuery(queryOptions);
};
