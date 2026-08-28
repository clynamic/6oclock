import { ErrorOutlined, HourglassTop, Schedule } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router';

import { JobOverview } from '../../api';
import { JobStanding, getJobFact, getJobStanding } from './JobsOverviewUtils';

export interface JobsOverviewFrameProps {
  job?: JobOverview;
}

const standingIcon: Record<JobStanding, React.ReactElement> = {
  running: <HourglassTop fontSize="inherit" />,
  erroring: <ErrorOutlined fontSize="inherit" />,
  waiting: <Schedule fontSize="inherit" />,
};

const standingColor: Record<JobStanding, string> = {
  running: 'info.main',
  erroring: 'error.main',
  waiting: 'text.secondary',
};

export const JobsOverviewFrame: React.FC<JobsOverviewFrameProps> = ({
  job,
}) => {
  const standing = job && getJobStanding(job);

  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea
        component={Link}
        to={`/health/jobs/${job?.id ?? ''}`}
        disabled={!job}
        sx={{ p: 2 }}
      >
        <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline' }}>
          <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap>
            {job?.id ?? <Skeleton width="50%" />}
          </Typography>
          <Stack
            direction="row"
            sx={{
              gap: 0.5,
              alignItems: 'center',
              color: standing && standingColor[standing],
            }}
          >
            {standing ? standingIcon[standing] : null}
            <Typography variant="caption" color="inherit" noWrap>
              {job ? getJobFact(job) : <Skeleton width={72} />}
            </Typography>
          </Stack>
        </Stack>
        {job?.errors ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {job.failedReason}
          </Typography>
        ) : null}
      </CardActionArea>
    </Card>
  );
};
