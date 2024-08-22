import {
  InfiniteData,
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import _ from "lodash";
import { useCallback, useMemo } from "react";

import { getPostQueryKey, getPostsQueryKey, Post, posts, User } from "../api";

const POST_ID_BATCH_SIZE = 40;

export interface UseManyPostsConfig {
  query?: Partial<
    UseInfiniteQueryOptions<
      Post[],
      Error | null,
      InfiniteData<Post[], number | undefined>,
      Post[],
      QueryKey,
      number | undefined
    >
  >;
}

export const useManyPosts = (
  postIds?: number[],
  config?: UseManyPostsConfig
) => {
  const queryClient = useQueryClient();

  const ids = useMemo(() => Array.from(new Set(postIds)).sort(), [postIds]);
  const batches = useMemo(() => _.chunk(ids, POST_ID_BATCH_SIZE), [ids]);

  const params = useMemo(() => ({ tags: `id:${ids?.join(",")}` }), [ids]);

  const fetchPostsBatch = useCallback(
    async ({
      pageParam = 0,
    }: QueryFunctionContext<QueryKey, number | undefined>) => {
      const batch = batches[pageParam];
      if (!batch) return [];
      const result = await posts(params);

      result.forEach((post: Post) => {
        queryClient.setQueryData(getPostQueryKey(post.id), post);
      });

      return result;
    },
    [batches, params, queryClient]
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
      queryKey: getPostsQueryKey(params),
      initialPageParam: 0,
      getNextPageParam: (_, pages) => {
        const nextBatchIndex = pages.length;
        return nextBatchIndex < batches.length ? nextBatchIndex : undefined;
      },
      enabled: ids.length > 0,
      ...config?.query,
    }),
    [batches.length, config?.query, fetchPostsBatch, ids.length, params]
  );

  return useInfiniteQuery(queryOptions);
};

export const useManyAvatars = (users?: User[], config?: UseManyPostsConfig) => {
  return useManyPosts(
    users
      ?.filter((u) => u.avatar_id != null)
      .map((u) => u.avatar_id) as number[],
    config
  );
};
