import { GetNextPageParamFunction } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";

import { PostVersion, usePostVersionsInfinite } from "../api";
import { DateRange, getCurrentMonthRange, useDrain } from "../utils";
import {
  useLoadLocalCache,
  UseLocalCacheParams,
  useStoreLocalCache,
} from "./context";
import {
  findHighestId,
  findLowestId,
  findUncachedItems,
  mergeWithCache,
} from "./helpers";

const dbType = "post_versions";

export const useLoadPostVersions = (params?: UseLocalCacheParams) =>
  useLoadLocalCache<PostVersion>(dbType, params);

export const useStorePostVersions = () =>
  useStoreLocalCache<PostVersion>(dbType);

export const useCachedPostVersions = (dateRange?: DateRange) => {
  const range = useMemo(() => dateRange ?? getCurrentMonthRange(), [dateRange]);

  const { data: cachedPostVersions, isLoading: isLoadingCache } =
    useLoadPostVersions({ updated: range });

  const { mutate: storePostVersions } = useStorePostVersions();

  const lastKnownPostVersion = useMemo(
    () => findHighestId(cachedPostVersions),
    [cachedPostVersions]
  );

  const {
    data: freshPostVersions,
    isLoading: isLoadingFresh,
    isFetching,
    isError,
    refetch,
  } = useDrain<PostVersion>(
    usePostVersionsInfinite(
      {
        limit: 320,
        "search[created_at]": `${dayjs(range.start).format(
          "YYYY-MM-DD"
        )}..${dayjs(range.end).format("YYYY-MM-DD")}`,
        "search[uploads]": "only", // important part!
      },
      {
        query: {
          enabled: false, // !isLoadingCache,
          refetchOnMount: false,
          refetchInterval: 5 * 60 * 1000,
          initialPageParam: 1,
          getNextPageParam: ((lastPage) => {
            if (lastPage.length === 0) return undefined;
            if (lastKnownPostVersion?.id != null) {
              const lastId = lastPage[lastPage.length - 1].id;
              if (lastId <= lastKnownPostVersion.id) return undefined;
            }
            const lastDate = lastPage[lastPage.length - 1].updated_at;
            if (dayjs(lastDate).isBefore(range.start)) return undefined;
            // I dont know why this is necessary, but it is.
            return `b${Math.min(findLowestId(lastPage)!.id, lastKnownPostVersion?.id ?? Infinity)}`;
            // I fucking love lying
            // we have to do this, because we suddenly have to
            // use cursor pagination. sigh.
            // the post_versions endpoint doesn't allow us to go past page 31.
          }) as GetNextPageParamFunction<number | undefined, PostVersion[]>,
        },
      }
    )
  );

  useEffect(() => {
    if (freshPostVersions != null) {
      storePostVersions(
        findUncachedItems(cachedPostVersions, freshPostVersions)
      );
    }
  }, [cachedPostVersions, freshPostVersions, storePostVersions]);

  const postVersions = useMemo(
    () => mergeWithCache(cachedPostVersions, freshPostVersions),
    [cachedPostVersions, freshPostVersions]
  );

  return {
    data: postVersions,
    isLoading: isLoadingCache || isLoadingFresh,
    isFetching,
    isError,
    refetch,
  };
};
