import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useHandlerSummary } from '../../api';
import { LimitedList, NoDataHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';
import { TicketLeaderboardFrame } from './TicketLeaderboardFrame';

export const TicketLeaderboard: React.FC = () => {
  const range = useChartDateRange();

  const { data: ticketers } = useHandlerSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions(),
  );

  if (ticketers?.length === 0) return <NoDataHint />;

  return (
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
      {ticketers
        ? ticketers?.map((ticketer) => {
            return (
              <TicketLeaderboardFrame
                key={ticketer.userId}
                summary={ticketer}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <TicketLeaderboardFrame key={i} />
          ))}
    </LimitedList>
  );
};
