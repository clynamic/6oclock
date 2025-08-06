import { useEffect } from 'react';

import { Box, CircularProgress, Fade } from '@mui/material';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

export interface LoadMoreHintProps {
  query: Pick<
    UseInfiniteQueryResult<unknown, unknown>,
    'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage'
  >;
}

export const LoadMoreHint: React.FC<LoadMoreHintProps> = ({
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
      <Fade in={isFetchingNextPage} timeout={300}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <CircularProgress key="load-more-spinner" size={24} />
        </Box>
      </Fade>
    </>
  );
};
