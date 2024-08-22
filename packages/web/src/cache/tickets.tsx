import {
  InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  GetTicketsParams,
  getTicketsQueryKey,
  Ticket,
  useTicketsInfinite,
} from "../api";
import { LocalCacheQueryParams, useLocalCache } from "./context";
import { DateRange, getCurrentMonthRange, useDrain } from "../utils";
import { useEffect, useMemo } from "react";
import _ from "lodash";
import dayjs from "dayjs";

const dbType = "tickets";

export const useLoadTickets = (
  params: Omit<LocalCacheQueryParams, "type"> = {}
) => {
  const { query } = useLocalCache();

  return useQuery<Ticket[]>({
    queryKey: [dbType, params],
    queryFn: async () => {
      const tickets = await query<Ticket>({
        type: dbType,
        ...params,
      });

      return tickets.map((item) => item.value);
    },
  });
};

export const useStoreTickets = () => {
  const { store: mutate } = useLocalCache();

  return useMutation({
    mutationFn: async (tickets: Ticket[]) => {
      const now = new Date();

      await mutate<Ticket>(
        tickets.map((ticket) => ({
          type: dbType,
          value: ticket,
          updated: now,
        }))
      );
    },
  });
};

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
    startDate: range.start,
    endDate: range.end,
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
    if (freshTickets && freshTickets.length > 0) {
      const newTickets = _.differenceBy(
        freshTickets,
        cachedTickets ?? [],
        "id"
      );
      storeTickets(newTickets);
    }
  }, [cachedTickets, freshTickets, storeTickets]);

  const tickets = useMemo(() => {
    if (cachedTickets == null && freshTickets == null) return [];
    return _.unionBy(freshTickets ?? [], cachedTickets ?? [], "id");
  }, [cachedTickets, freshTickets]);

  return {
    data: tickets,
    isLoading: isLoadingCache || isLoadingFresh,
    isFetching,
    isError,
    refetch,
  };
};
