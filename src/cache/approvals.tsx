import {
  LocalCacheQueryParams,
  useLoadLocalCache,
  useStoreLocalCache,
} from "./context";
import { useMemo, useEffect } from "react";
import dayjs from "dayjs";
import {
  Approval,
  GetPostApprovalsParams,
  usePostApprovalsInfinite,
} from "../api";
import { useDrain, getCurrentMonthRange, DateRange } from "../utils";
import { findLowestId, findUncachedItems, mergeWithCache } from "./helpers";

const dbType = "approvals";

export const useLoadApprovals = (
  params: Omit<LocalCacheQueryParams, "type"> = {}
) => useLoadLocalCache<Approval>(dbType, params);

export const useStoreApprovals = () => useStoreLocalCache<Approval>(dbType);

export const useCachedApprovals = (dateRange?: DateRange) => {
  const range = useMemo(() => dateRange ?? getCurrentMonthRange(), [dateRange]);

  const { data: cachedApprovals, isLoading: isLoadingCache } = useLoadApprovals(
    { created: range }
  );

  const { mutate: storeApprovals } = useStoreApprovals();

  const lastKnownApproval = useMemo(
    () => findLowestId(cachedApprovals),
    [cachedApprovals]
  );

  const {
    data: freshApprovals,
    isLoading: isLoadingFresh,
    isFetching,
    isError,
    refetch,
  } = useDrain<Approval>(
    usePostApprovalsInfinite(
      {
        limit: 320,
        "search[created_at]": `${dayjs(range.start).format(
          "YYYY-MM-DD"
        )}..${dayjs(range.end).format("YYYY-MM-DD")}`,
        "search[id]": lastKnownApproval
          ? `<${lastKnownApproval.id}`
          : undefined,
      } as GetPostApprovalsParams,
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
    if (freshApprovals != null) {
      storeApprovals(findUncachedItems(cachedApprovals, freshApprovals));
    }
  }, [cachedApprovals, freshApprovals, storeApprovals]);

  const approvals = useMemo(
    () => mergeWithCache(cachedApprovals, freshApprovals),
    [cachedApprovals, freshApprovals]
  );

  return {
    data: approvals,
    isLoading: isLoadingCache || isLoadingFresh,
    isFetching,
    isError,
    refetch,
  };
};
