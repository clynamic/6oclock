import { useEffect, useMemo, useRef } from "react";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

interface UseDrainQueryResult<TData> {
  data: TData[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean | undefined;
}

export function useDrain<TData>(
  queryResult: UseInfiniteQueryResult<
    InfiniteData<TData[], unknown> | undefined,
    Error | null
  >,
  delay: number = 1000
): UseDrainQueryResult<TData> {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError,
  } = queryResult;

  const lastFetch = useRef<number>(0);

  useEffect(() => {
    const drain = async () => {
      if (hasNextPage && !isError && !isFetchingNextPage) {
        const now = Date.now();
        const elapsed = now - lastFetch.current;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(0, delay - elapsed))
        );
        lastFetch.current = Date.now();
        fetchNextPage();
      }
    };

    drain();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage, delay]);

  const flatData = useMemo(() => data?.pages.flat() ?? [], [data]);

  const isLoading = useMemo(
    () => isFetching || isFetchingNextPage,
    [isFetching, isFetchingNextPage]
  );

  return {
    data: flatData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
  };
}
