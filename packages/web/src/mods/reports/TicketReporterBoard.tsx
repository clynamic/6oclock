import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useTicketReporterSummary } from '../../api';
import { LimitedList, QueryHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';
import { TicketReporterFrame } from './TicketReporterFrame';

export const TicketReporterBoard: React.FC = () => {
  const range = useChartDateRange();

  const { data, isLoading, error } = useTicketReporterSummary(
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
        <TicketReporterFrame key={index} />
      ))}
    >
      <LimitedList
        indicator={() => (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to="/mods/reports"
            >
              See All
            </Button>
          </Stack>
        )}
      >
        {data?.map((user) => {
          return <TicketReporterFrame key={user.userId} summary={user} />;
        })}
      </LimitedList>
    </QueryHint>
  );
};
