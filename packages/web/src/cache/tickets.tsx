import { useMutation, useQuery } from "@tanstack/react-query";
import { GetTicketsParams, Ticket, useTicketsInfinite } from "../api";
import { LocalCacheQueryParams, useLocalCache } from "./context";
import { DateRange, getCurrentMonthRange, useDrain } from "../utils";
import { useEffect, useMemo, useState } from "react";
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
  const range = useMemo(() => dateRange ?? getCurrentMonthRange(), [dateRange]);

  const { data: cachedTickets, isLoading: isLoadingCache } = useLoadTickets({
    startDate: range.start,
    endDate: range.end,
  });

  const { mutate: storeTickets } = useStoreTickets();

  const { clearStale } = useLocalCache();

  const [lastKnownTicket, setLastKnownTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!isLoadingCache && cachedTickets && cachedTickets.length > 0) {
      setLastKnownTicket(
        cachedTickets.reduce((prev, current) =>
          prev.id > current.id ? prev : current
        )
      );
      clearStale(dbType, 5 * 60 * 1000).then(() => {
        setLastKnownTicket(null);
      });
    }
  }, [cachedTickets, clearStale, isLoadingCache]);

  const {
    data: freshTickets,
    isLoading: isLoadingFresh,
    isFetching,
    isError,
    refetch,
  } = useDrain<Ticket>(
    useTicketsInfinite(
      {
        limit: 320,
        "search[created_at]": `${dayjs(range.start).format("YYYY-MM-DD")}..${dayjs(range.end).format("YYYY-MM-DD")}`,
        "search[id]": lastKnownTicket ? `<${lastKnownTicket.id}` : undefined,
      } as GetTicketsParams,
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
