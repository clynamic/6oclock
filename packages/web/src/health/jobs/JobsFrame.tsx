import {
  Cancel,
  Check,
  ErrorOutline,
  Event,
  HourglassDisabled,
  HourglassTop,
  Schedule,
} from '@mui/icons-material';
import { Card, Chip, Stack, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

import { JobInfo } from '../../api';

export interface JobsFrameProps {
  job: JobInfo;
}

export const JobsFrame: React.FC<JobsFrameProps> = ({ job }) => {
  return (
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
            icon={<Event />}
            label={
              job.endedAt
                ? formatDistanceToNow(job.endedAt, { addSuffix: true })
                : job.startedAt
                  ? formatDistanceToNow(job.startedAt, { addSuffix: true })
                  : 'Upcoming'
            }
          />
          <Chip
            icon={
              job.succeeded ? (
                <Check />
              ) : job.timedOut ? (
                <HourglassDisabled />
              ) : job.cancelled ? (
                <Cancel />
              ) : job.failed ? (
                <ErrorOutline />
              ) : job.startedAt ? (
                <HourglassTop />
              ) : (
                <Schedule />
              )
            }
            label={
              job.succeeded
                ? 'Succeeded'
                : job.timedOut
                  ? 'Timed Out'
                  : job.cancelled
                    ? 'Cancelled'
                    : job.failed
                      ? 'Failed'
                      : job.startedAt
                        ? 'Running'
                        : 'Pending'
            }
            color={
              job.succeeded
                ? 'success'
                : job.cancelled || job.failed
                  ? 'error'
                  : job.startedAt
                    ? 'warning'
                    : 'info'
            }
          />
        </Stack>
      </Stack>
    </Card>
  );
};
