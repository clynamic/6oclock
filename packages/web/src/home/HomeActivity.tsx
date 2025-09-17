import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { Activity, TimeScale, useDailyActivity } from '../api';
import { hexagonColors } from '../app/theme';
import { CounterDisplay } from '../common/CounterDisplay';

const getActivityDisplayName = (
  activity?: Activity,
  timescale?: TimeScale,
): string => {
  const timeLabel = getTimeLabel(timescale);

  switch (activity) {
    case Activity.post_create:
      return `Posts Created ${timeLabel}`;
    case Activity.post_delete:
      return `Posts Deleted ${timeLabel}`;
    case Activity.post_approve:
      return `Posts Approved ${timeLabel}`;
    case Activity.post_replacement_create:
      return `Replacements Created ${timeLabel}`;
    case Activity.post_replacement_approve:
      return `Replacements Approved ${timeLabel}`;
    case Activity.post_replacement_promote:
      return `Replacements Promoted ${timeLabel}`;
    case Activity.post_replacement_reject:
      return `Replacements Rejected ${timeLabel}`;
    case Activity.ticket_create:
      return `Tickets Created ${timeLabel}`;
    case Activity.ticket_handle:
      return `Tickets Handled ${timeLabel}`;
    default:
      return `Activity ${timeLabel}`;
  }
};

const getTimeLabel = (timescale?: TimeScale): string => {
  switch (timescale) {
    case TimeScale.minute:
      return 'This Minute';
    case TimeScale.hour:
      return 'This Hour';
    case TimeScale.day:
      return 'Today';
    case TimeScale.week:
      return 'This Week';
    case TimeScale.month:
      return 'This Month';
    case TimeScale.year:
      return 'This Year';
    case TimeScale.decade:
      return 'This Decade';
    case TimeScale.all:
      return 'All Time';
    default:
      return 'Recently';
  }
};

export const HomeActivity: React.FC = () => {
  const { data, isLoading } = useDailyActivity();

  const counterValue = isLoading ? 0 : (data?.value ?? 0);
  const displayName = getActivityDisplayName(data?.activity, data?.timescale);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        textAlign: 'center',
        backgroundColor: hexagonColors.section,
      }}
    >
      <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
        <CounterDisplay number={counterValue} />
      </Stack>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
        }}
      >
        {displayName}
      </Typography>
    </Box>
  );
};
