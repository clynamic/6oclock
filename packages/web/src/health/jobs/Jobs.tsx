import {
  ArrowForward,
  CalendarMonth,
  Cancel,
  Check,
  Schedule,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';

import { useJobs } from '../../api';
import { LimitedList, NoDataHint } from '../../common';

export const JobsDisplay = () => {
  const { data } = useJobs(
    {
      limit: 10,
    },
    {
      query: {
        refetchInterval: 10000,
      },
    },
  );

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return <NoDataHint />;
  }

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            endIcon={<ArrowForward />}
            component={Link}
            to="/"
          >
            See All
          </Button>
        </Stack>
      )}
    >
      {data.map((job) => (
        <Card key={job.id} sx={{ width: '100%' }}>
          <Stack p={2} spacing={1} sx={{ width: '100%' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ width: '100%' }}
            >
              <Typography variant="h6">{`${job.title}`}</Typography>
            </Stack>
            <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
              <Chip
                icon={<CalendarMonth />}
                label={
                  job.endedAt
                    ? DateTime.fromJSDate(job.endedAt).toRelative()
                    : job.startedAt
                      ? DateTime.fromJSDate(job.startedAt).toRelative()
                      : '...'
                }
              />
              <Chip
                icon={
                  job.succeeded ? (
                    <Check />
                  ) : job.cancelled ? (
                    <Cancel />
                  ) : (
                    <Schedule />
                  )
                }
                label={
                  job.succeeded
                    ? 'Succeeded'
                    : job.cancelled
                      ? 'Cancelled'
                      : 'Running'
                }
                color={
                  job.succeeded
                    ? 'success'
                    : job.cancelled
                      ? 'error'
                      : 'warning'
                }
              />
            </Stack>
          </Stack>
        </Card>
      ))}
    </LimitedList>
  );
};
