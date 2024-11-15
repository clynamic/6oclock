import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useTicketHandlerSummary } from '../../api';
import { LimitedList, NoDataHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';
import { TicketerFrame } from './TicketerFrame';

export const TicketerLeaderboard: React.FC = () => {
  const range = useChartDateRange();

  const { data: ticketers } = useTicketHandlerSummary(
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
            return <TicketerFrame key={ticketer.userId} summary={ticketer} />;
          })
        : Array.from({ length: 5 }).map((_, i) => <TicketerFrame key={i} />)}
    </LimitedList>
  );
};
