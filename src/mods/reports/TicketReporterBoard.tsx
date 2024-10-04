import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useTicketReporterSummary } from '../../api';
import { LimitedList, NoDataHint } from '../../common';
import { refetchQueryOptions, useChartDateRange } from '../../utils';
import { TicketReporterFrame } from './TicketReporterFrame';

export const TicketReporterBoard: React.FC = () => {
  const range = useChartDateRange();

  const { data: reporters } = useTicketReporterSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions(),
  );

  if (reporters?.length === 0) return <NoDataHint />;

  return (
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
      {reporters
        ? reporters.map((reporter) => {
            return (
              <TicketReporterFrame key={reporter.userId} summary={reporter} />
            );
          })
        : Array.from({ length: 5 }).map((_, index) => (
            <TicketReporterFrame key={index} />
          ))}
    </LimitedList>
  );
};
