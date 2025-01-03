import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useTicketHandlerSummary } from '../../api';
import { LimitedList, QueryHint } from '../../common';
import { refetchQueryOptions, useChartRange } from '../../utils';
import { TicketerFrame } from './TicketerFrame';

export const TicketerLeaderboard: React.FC = () => {
  const range = useChartRange();

  const { data, isLoading, error } = useTicketHandlerSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions(),
  );

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      error={error}
      skeleton={Array.from({ length: 5 }).map((_, index) => (
        <TicketerFrame key={index} />
      ))}
    >
      <LimitedList
        indicator={() => (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to="/mods/tickets"
            >
              See All
            </Button>
          </Stack>
        )}
      >
        {data?.map((ticketer) => {
          return <TicketerFrame key={ticketer.userId} summary={ticketer} />;
        })}
      </LimitedList>
    </QueryHint>
  );
};
