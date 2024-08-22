import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import _ from "lodash";
import { useEffect, useMemo } from "react";

import {
  GetTicketsParams,
  getTicketsQueryKey,
  Ticket,
  useTicketsInfinite,
} from "../api";
import { DateRange, getCurrentMonthRange, useDrain } from "../utils";
import {
  LocalCacheQueryParams,
  useLoadLocalCache,
  useLocalCache,
  useStoreLocalCache,
} from "./context";
import { findUncachedItems, mergeWithCache } from "./helpers";

const dbType = "tickets";

export const useLoadTickets = (
  params: Omit<LocalCacheQueryParams, "type"> = {}
) => useLoadLocalCache<Ticket>(dbType, params);

export const useStoreTickets = () => useStoreLocalCache<Ticket>(dbType);

export const useCachedTickets = (dateRange?: DateRange) => {
  const queryClient = useQueryClient();

  const range = useMemo(() => dateRange ?? getCurrentMonthRange(), [dateRange]);
  const params = useMemo<GetTicketsParams>(
    () => ({
      limit: 320,
      "search[created_at]": `${dayjs(range.start).format("YYYY-MM-DD")}..${dayjs(range.end).format("YYYY-MM-DD")}`,
    }),
    [range]
  );

  const { data: cachedTickets, isLoading: isLoadingCache } = useLoadTickets({
    created: range,
  });

  const { mutate: storeTickets } = useStoreTickets();

  const { clearStale } = useLocalCache();

  useEffect(() => {
    if (!isLoadingCache && cachedTickets && cachedTickets.length > 0) {
      const queryKey = getTicketsQueryKey(params);
      const chunks = _.chunk(cachedTickets, 320);
      const initialData: InfiniteData<Ticket[]> = {
        pages: chunks,
        pageParams: chunks.map((_, i) => i + 1),
      };
      queryClient.setQueryData(queryKey, initialData);
      clearStale(dbType, 5 * 60 * 1000);
    }
  }, [cachedTickets, clearStale, isLoadingCache, params, queryClient]);

  const {
    data: freshTickets,
    isLoading: isLoadingFresh,
    isFetching,
    isError,
    refetch,
  } = useDrain<Ticket>(
    useTicketsInfinite(params, {
      query: {
        enabled: !isLoadingCache,
        refetchInterval: 5 * 60 * 1000,
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, i) => {
          if (lastPage.length === 0) return undefined;
          return (i ?? 1) + 1;
        },
      },
    })
  );

  useEffect(() => {
    if (freshTickets) {
      storeTickets(findUncachedItems(cachedTickets, freshTickets));
    }
  }, [cachedTickets, freshTickets, storeTickets]);

  const tickets = useMemo(
    () => mergeWithCache(cachedTickets, freshTickets),
    [cachedTickets, freshTickets]
  );

  return {
    data: tickets,
    isLoading: isLoadingCache || isLoadingFresh,
    isFetching,
    isError,
    refetch,
  };
};
