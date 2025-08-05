import { Box, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { startOfDay } from 'date-fns';
import { TZDate } from '@date-fns/tz';

import {
  TimeScale,
  useTicketStatus,
  useApprovalCountSeries,
  usePostReplacementStatus,
  useDeletionCountSeries,
} from '../api';
import { SHIP_TIMEZONE } from '../utils/timezone';
import { refetchQueryOptions } from '../utils/query';
import { CounterDisplay } from '../common/CounterDisplay';
import { startOfPeriod, addPeriods } from '../utils/ranges';

interface CounterOption {
  name: string;
  weight: number;
  value: number;
}

const createSeededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
};

const getCounterRange = () => {
  const now = new TZDate(new Date(), SHIP_TIMEZONE);
  const today = startOfDay(now);
  const scale = TimeScale.week;
  const startDate = startOfPeriod(today, scale);
  const endDate = addPeriods(startDate, scale, 1);

  return {
    startDate,
    endDate,
    timezone: SHIP_TIMEZONE,
    scale: TimeScale.all,
  };
};

const getTodaySeed = () => {
  const now = new TZDate(new Date(), SHIP_TIMEZONE);
  const today = startOfDay(now);
  return Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
};

export const HomeCounter: React.FC = () => {
  const counterRange = useMemo(() => getCounterRange(), []);

  const selectedCounterType = useMemo(() => {
    const options = [
      { name: 'tickets', weight: 40 },
      { name: 'approvals', weight: 40 },
      { name: 'replacements', weight: 10 },
      { name: 'deletions', weight: 10 },
    ];

    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
    const seed = getTodaySeed();
    const random = createSeededRandom(seed);
    const randomValue = random() * totalWeight;

    let currentWeight = 0;
    for (const option of options) {
      currentWeight += option.weight;
      if (randomValue <= currentWeight) {
        return option.name;
      }
    }

    return options[0].name;
  }, []);

  const { data: ticketData, isLoading: ticketLoading } = useTicketStatus(
    counterRange,
    {
      query: {
        ...refetchQueryOptions(),
        enabled: selectedCounterType === 'tickets',
        select: (data) => data?.[0],
      },
    },
  );

  const { data: approvalData, isLoading: approvalLoading } =
    useApprovalCountSeries(counterRange, {
      query: {
        ...refetchQueryOptions(),
        enabled: selectedCounterType === 'approvals',
        select: (data) =>
          data?.reduce((sum, point) => sum + point.value, 0) ?? 0,
      },
    });

  const { data: replacementData, isLoading: replacementLoading } =
    usePostReplacementStatus(counterRange, {
      query: {
        ...refetchQueryOptions(),
        enabled: selectedCounterType === 'replacements',
        select: (data) =>
          data?.reduce(
            (sum, point) =>
              sum + point.approved + point.promoted + point.rejected,
            0,
          ) ?? 0,
      },
    });

  const { data: deletionData, isLoading: deletionLoading } =
    useDeletionCountSeries(counterRange, {
      query: {
        ...refetchQueryOptions(),
        enabled: selectedCounterType === 'deletions',
        select: (data) =>
          data?.reduce((sum, point) => sum + point.value, 0) ?? 0,
      },
    });

  const selectedCounter = useMemo(() => {
    const isLoading =
      (selectedCounterType === 'tickets' && ticketLoading) ||
      (selectedCounterType === 'approvals' && approvalLoading) ||
      (selectedCounterType === 'replacements' && replacementLoading) ||
      (selectedCounterType === 'deletions' && deletionLoading);

    const counterConfigs: Record<string, CounterOption> = {
      tickets: {
        name: 'Tickets Handled This Week',
        weight: 40,
        value: isLoading
          ? 0
          : (ticketData?.approved ?? 0) + (ticketData?.partial ?? 0),
      },
      approvals: {
        name: 'Approvals This Week',
        weight: 40,
        value: isLoading ? 0 : (approvalData ?? 0),
      },
      replacements: {
        name: 'Replacements Handled This Week',
        weight: 10,
        value: isLoading ? 0 : (replacementData ?? 0),
      },
      deletions: {
        name: 'Posts Deleted This Week',
        weight: 10,
        value: isLoading ? 0 : (deletionData ?? 0),
      },
    };

    return counterConfigs[selectedCounterType];
  }, [
    selectedCounterType,
    ticketData,
    approvalData,
    replacementData,
    deletionData,
    ticketLoading,
    approvalLoading,
    replacementLoading,
    deletionLoading,
  ]);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        textAlign: 'center',
        backgroundColor: 'action.hover',
      }}
    >
      <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
        <CounterDisplay number={selectedCounter.value} />
      </Stack>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
        }}
      >
        {selectedCounter.name}
      </Typography>
    </Box>
  );
};
