import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useTicketReporterSummary } from '../../api';
import { LimitedList } from '../../common/LimitedList';
import { QueryHint } from '../../common/QueryHint';
import { useChartRange } from '../../utils/charts';
import { refetchQueryOptions } from '../../utils/query';
import { TicketReporterFrame } from './TicketReporterFrame';

export const TicketReporterBoard: React.FC = () => {
  const range = useChartRange();

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


