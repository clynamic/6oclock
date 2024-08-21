import { useCallback, useMemo } from "react";
import { Post, posts, GetPostsParams, getPostsQueryKey } from "../api";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
  QueryFunctionContext,
  QueryKey,
} from "@tanstack/react-query";
import { splitIntoBatches } from "./batches";

const POST_ID_BATCH_SIZE = 40;

export interface UseManyPostsConfig {
  params?: GetPostsParams;
  options?: UseInfiniteQueryOptions<
    Post[],
    Error | null,
    InfiniteData<Post[], number | undefined>,
    Post[],
    QueryKey,
    number | undefined
  >;
}

export const useManyPosts = (
  postIds?: number[],
  config?: UseManyPostsConfig
) => {
  const batches = useMemo(
    () =>
      splitIntoBatches(Array.from(new Set(postIds)).sort(), POST_ID_BATCH_SIZE),
    [postIds]
  );

  const queryKey = getPostsQueryKey({
    ...config?.params,
    tags: `id:${postIds?.join(",")}`,
  });

  const fetchPostsBatch = useCallback(
    async ({
      pageParam = 0,
    }: QueryFunctionContext<QueryKey, number | undefined>) => {
      const batch = batches[pageParam];
      if (!batch) return [];
      return await posts({
        ...config?.params,
        tags: `id:${batch.join(",")}`,
      });
    },
    [batches, config?.params]
  );

  const queryOptions: UseInfiniteQueryOptions<
    Post[],
    Error | null,
    InfiniteData<Post[], number | undefined>,
    Post[],
    QueryKey,
    number | undefined
  > = useMemo(
    () => ({
      queryFn: fetchPostsBatch,
      queryKey,
      initialPageParam: 0,
      getNextPageParam: (_, pages) => {
        const nextBatchIndex = pages.length;
        return nextBatchIndex < batches.length ? nextBatchIndex : undefined;
      },
      enabled: !!postIds && postIds.length > 0,
      ...config?.options,
    }),
    [batches.length, config?.options, fetchPostsBatch, postIds, queryKey]
  );

  return useInfiniteQuery(queryOptions);
};
