import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useTileHealth } from '../../api';
import { LimitedList } from '../../common/LimitedList';
import { QueryHint } from '../../common/QueryHint';
import { TileHealthFrame } from './TileHealthFrame';

export const TileHealthDisplay = () => {
  const { data, isLoading, error } = useTileHealth(
    {
      limit: 5,
    },
    {
      query: {
        refetchInterval: 10000,
      },
    },
  );

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      isEmpty={!data?.length}
      error={error}
      skeleton={
        <LimitedList>
          {Array.from({ length: 5 }).map((_, index) => (
            <TileHealthFrame key={index} extended={false} />
          ))}
        </LimitedList>
      }
    >
      <LimitedList
        indicator={() => (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to="/health/tiles"
            >
              See All
            </Button>
          </Stack>
        )}
      >
        {data?.map((tile) => (
          <TileHealthFrame key={tile.type} tile={tile} />
        ))}
      </LimitedList>
    </QueryHint>
  );
};
