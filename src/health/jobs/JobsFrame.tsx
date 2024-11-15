import {
  CalendarMonth,
  Cancel,
  Check,
  ErrorOutline,
  Schedule,
} from '@mui/icons-material';
import { Card, Chip, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';

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
              ) : job.failed ? (
                <ErrorOutline />
              ) : (
                <Schedule />
              )
            }
            label={
              job.succeeded
                ? 'Succeeded'
                : job.cancelled
                  ? 'Cancelled'
                  : job.failed
                    ? 'Failed'
                    : 'Running'
            }
            color={
              job.succeeded
                ? 'success'
                : job.cancelled || job.failed
                  ? 'error'
                  : 'warning'
            }
          />
        </Stack>
      </Stack>
    </Card>
  );
};
