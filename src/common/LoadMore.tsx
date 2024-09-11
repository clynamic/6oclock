import { CircularProgress } from "@mui/material";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export interface LoadMoreProps {
  query: Pick<
    UseInfiniteQueryResult<unknown, unknown>,
    "fetchNextPage" | "hasNextPage" | "isFetchingNextPage"
  >;
}

export const LoadMore: React.FC<LoadMoreProps> = ({
  query: { fetchNextPage, hasNextPage, isFetchingNextPage },
}) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div ref={ref} style={{ height: 1 }} />
      {isFetchingNextPage && <CircularProgress />}
    </>
  );
};