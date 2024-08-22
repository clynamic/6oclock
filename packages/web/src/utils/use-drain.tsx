import { useEffect, useMemo, useRef } from "react";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";

type UseDrainQueryResult<TData> = Omit<
  UseQueryResult<InfiniteData<TData[], unknown> | undefined, Error | null>,
  "data"
> & {
  data: TData[] | undefined;
};

export interface UseDrainOptions {
  delay?: number;
}

export function useDrain<TData>(
  queryResult: UseInfiniteQueryResult<
    InfiniteData<TData[], unknown> | undefined,
    Error | null
  >,
  { delay = 1000 }: UseDrainOptions = {}
): UseDrainQueryResult<TData> {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError,
    ...rest
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

  const flatData = useMemo(() => data?.pages.flat(), [data]);

  return {
    ...rest,
    data: flatData,
    isFetching,
    isError,
  };
}
