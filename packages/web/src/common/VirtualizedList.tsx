import { useCallback } from 'react';

import { Box, CircularProgress, Fade } from '@mui/material';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';

import { usePageScroll } from '../page/PageScrollContext';

export interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (index: number, item: T) => React.ReactNode;
  query: Pick<
    UseInfiniteQueryResult<unknown, unknown>,
    'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage'
  >;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  query: { fetchNextPage, hasNextPage, isFetchingNextPage },
}: VirtualizedListProps<T>) {
  const scrollParent = usePageScroll();

  const endReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!scrollParent) return null;

  return (
    <Virtuoso
      data={items}
      customScrollParent={scrollParent}
      itemContent={(index, item) => (
        <Box sx={{ pb: 1 }}>{renderItem(index, item)}</Box>
      )}
      endReached={endReached}
      components={{
        Footer: () => (
          <Fade in={isFetchingNextPage} timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 2,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          </Fade>
        ),
      }}
    />
  );
}
