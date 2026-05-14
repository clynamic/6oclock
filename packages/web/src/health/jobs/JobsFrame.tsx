import {
  Check,
  ErrorOutline,
  Event,
  HourglassTop,
  Schedule,
} from '@mui/icons-material';
import { Card, Chip, Stack, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

import { JobInfo } from '../../api';

export interface JobsFrameProps {
  job: JobInfo;
}

const stateIcon: Record<string, React.ReactElement> = {
  completed: <Check />,
  failed: <ErrorOutline />,
  active: <HourglassTop />,
  waiting: <Schedule />,
  delayed: <Schedule />,
};

const stateLabel: Record<string, string> = {
  completed: 'Completed',
  failed: 'Failed',
  active: 'Running',
  waiting: 'Waiting',
  delayed: 'Scheduled',
};

const stateColor: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  completed: 'success',
  failed: 'error',
  active: 'warning',
  waiting: 'info',
  delayed: 'info',
};

export const JobsFrame: React.FC<JobsFrameProps> = ({ job }) => {
  return (
    <Card key={job.id} sx={{ width: '100%' }}>
      <Stack p={2} spacing={1} sx={{ width: '100%' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Typography variant="h6">{job.name}</Typography>
        </Stack>
        <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
          <Chip
            icon={<Event />}
            label={
              job.endedAt
                ? formatDistanceToNow(job.endedAt, { addSuffix: true })
                : job.startedAt
                  ? formatDistanceToNow(job.startedAt, { addSuffix: true })
                  : job.scheduledAt
                    ? formatDistanceToNow(job.scheduledAt, { addSuffix: true })
                    : 'Upcoming'
            }
          />
          <Chip
            icon={stateIcon[job.state] ?? <Schedule />}
            label={stateLabel[job.state] ?? job.state}
            color={stateColor[job.state] ?? 'default'}
          />
        </Stack>
      </Stack>
    </Card>
  );
};
