import { useQuery, useMutation } from "@tanstack/react-query";
import { LocalCacheQueryParams, useLocalCache } from "./context";
import { useMemo, useEffect, useState } from "react";
import dayjs from "dayjs";
import _ from "lodash";
import {
  Approval,
  GetPostApprovalsParams,
  usePostApprovalsInfinite,
} from "../api";
import { useDrain, getCurrentMonthRange, DateRange } from "../utils";

const dbType = "approvals";

export const useLoadApprovals = (
  params: Omit<LocalCacheQueryParams, "type"> = {}
) => {
  const { query } = useLocalCache();

  return useQuery<Approval[]>({
    queryKey: [dbType, params],
    queryFn: async () => {
      const approvals = await query<Approval>({
        type: dbType,
        ...params,
      });

      return approvals.map((item) => item.value);
    },
  });
};

export const useStoreApprovals = () => {
  const { store: mutate } = useLocalCache();

  return useMutation({
    mutationFn: async (approvals: Approval[]) => {
      const now = new Date();

      await mutate<Approval>(
        approvals.map((approval) => ({
          type: dbType,
          value: approval,
          updated: now,
        }))
      );
    },
  });
};

export const useCachedApprovals = (dateRange?: DateRange) => {
  const range = useMemo(() => dateRange ?? getCurrentMonthRange(), [dateRange]);

  const { data: cachedApprovals, isLoading: isLoadingCache } = useLoadApprovals(
    {
      startDate: range.start,
      endDate: range.end,
    }
  );

  const { mutate: storeApprovals } = useStoreApprovals();

  const [lastKnownApproval, setLastKnownApproval] = useState<Approval | null>(
    null
  );

  useEffect(() => {
    if (
      !isLoadingCache &&
      cachedApprovals != null &&
      cachedApprovals.length > 0
    ) {
      setLastKnownApproval(
        cachedApprovals.reduce((prev, current) =>
          prev.id < current.id ? prev : current
        )
      );
    }
  }, [isLoadingCache, cachedApprovals]);

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
          staleTime: 5 * 60 * 1000,
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
      const newApprovals = _.differenceBy(
        freshApprovals,
        cachedApprovals ?? [],
        "id"
      );
      storeApprovals(newApprovals);
    }
  }, [cachedApprovals, freshApprovals, storeApprovals]);

  const approvals = useMemo(() => {
    if (freshApprovals == null && cachedApprovals == null) return undefined;
    return _.unionBy(freshApprovals ?? [], cachedApprovals ?? [], "id");
  }, [cachedApprovals, freshApprovals]);

  return {
    data: approvals,
    isLoading: isLoadingCache || isLoadingFresh,
    isFetching,
    isError,
    refetch,
  };
};
