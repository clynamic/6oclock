import dayjs from "dayjs";
import { useEffect,useMemo } from "react";

import { GetUploadsParams, Upload, useUploadsInfinite } from "../api";
import { DateRange,getCurrentMonthRange, useDrain } from "../utils";
import {
  useLoadLocalCache,
  UseLocalCacheParams,
  useStoreLocalCache,
} from "./context";
import { findLowestId, findUncachedItems, mergeWithCache } from "./helpers";

const dbType = "uploads";

export const useLoadUploads = (params?: UseLocalCacheParams) =>
  useLoadLocalCache<Upload>(dbType, params);

export const useStoreUploads = () => useStoreLocalCache<Upload>(dbType);

export const useCachedUploads = (dateRange?: DateRange) => {
  const range = useMemo(() => dateRange ?? getCurrentMonthRange(), [dateRange]);

  const { data: cachedUploads, isLoading: isLoadingCache } = useLoadUploads({
    created: range,
  });

  const { mutate: storeUploads } = useStoreUploads();

  const lastKnownUpload = useMemo(
    () => findLowestId(cachedUploads),
    [cachedUploads]
  );

  const {
    data: freshUploads,
    isLoading: isLoadingFresh,
    isFetching,
    isError,
    refetch,
  } = useDrain<Upload>(
    useUploadsInfinite(
      {
        limit: 320,
        "search[created_at]": `${dayjs(range.start).format(
          "YYYY-MM-DD"
        )}..${dayjs(range.end).format("YYYY-MM-DD")}`,
        "search[status]": "completed",
        "search[id]": lastKnownUpload ? `<${lastKnownUpload.id}` : undefined,
      } as GetUploadsParams,
      {
        query: {
          enabled: !isLoadingCache,
          refetchOnMount: false,
          refetchInterval: 5 * 60 * 1000,
          initialPageParam: 1,
          getNextPageParam: (lastPage, _, i) => {
            if (lastPage.length === 0) return undefined;
            return (i ?? 1) + 1;
          },
        },
      }
    )
  );

  useEffect(() => {
    if (freshUploads != null) {
      storeUploads(findUncachedItems(cachedUploads, freshUploads));
    }
  }, [cachedUploads, freshUploads, storeUploads]);

  const uploads = useMemo(
    () => mergeWithCache(cachedUploads, freshUploads),
    [cachedUploads, freshUploads]
  );

  return {
    data: uploads,
    isLoading: isLoadingCache || isLoadingFresh,
    isFetching,
    isError,
    refetch,
  };
};
