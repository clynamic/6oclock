import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { usePerformance, UserArea } from '../../api';
import { LimitedList, QueryHint } from '../../common';
import { refetchQueryOptions, useChartValue } from '../../utils';
import { PerformanceFrame } from './PerformanceFrame';

export const PerformanceLeaderboard: React.FC = () => {
  const { range, area } = useChartValue();

  const { data, isLoading, error } = usePerformance(
    {
      ...range,
      area,
      head: true,
    },
    refetchQueryOptions(),
  );

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      error={error}
      skeleton={Array.from({ length: 5 }).map((_, index) => (
        <PerformanceFrame key={index} />
      ))}
    >
      <LimitedList
        indicator={() => (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              endIcon={<ArrowForward />}
              component={Link}
              to={
                area === UserArea.moderator
                  ? '/mods/performance'
                  : area === UserArea.janitor
                    ? '/janitors/performance'
                    : '/users/performance'
              }
            >
              See All
            </Button>
          </Stack>
        )}
      >
        {data?.map((ticketer) => {
          return <PerformanceFrame key={ticketer.userId} summary={ticketer} />;
        })}
      </LimitedList>
    </QueryHint>
  );
};
