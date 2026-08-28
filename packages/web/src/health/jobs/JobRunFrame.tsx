import {
  Check,
  ErrorOutlined,
  HourglassTop,
  Schedule,
  TimerOff,
} from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

import { JobInfo } from '../../api';
import { formatRunLength, runDuration, runStarted } from './JobsOverviewUtils';

export interface JobRunFrameProps {
  run?: JobInfo;
  selected?: boolean;
  onSelect?: () => void;
}

const stateColor: Record<string, string> = {
  active: 'info.main',
  failed: 'error.main',
  timedOut: 'warning.main',
};

const stateIcon: Record<string, React.ReactElement> = {
  active: <HourglassTop fontSize="inherit" />,
  waiting: <Schedule fontSize="inherit" />,
  delayed: <Schedule fontSize="inherit" />,
  completed: <Check fontSize="inherit" />,
  failed: <ErrorOutlined fontSize="inherit" />,
  timedOut: <TimerOff fontSize="inherit" />,
};

const stateLabel: Record<string, string> = {
  active: 'running',
  waiting: 'queued',
  delayed: 'scheduled',
  completed: 'completed',
  failed: 'errored',
  timedOut: 'timed out',
};

export const JobRunFrame: React.FC<JobRunFrameProps> = ({
  run,
  selected,
  onSelect,
}) => {
  const started = run && runStarted(run);
  const duration = run && runDuration(run);

  return (
    <Card
      sx={{
        width: '100%',
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'transparent',
      }}
    >
      <CardActionArea onClick={onSelect} disabled={!run} sx={{ p: 2 }}>
        <Stack sx={{ gap: 0.5, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontFamily: 'monospace',
            }}
            noWrap
          >
            {run ? run.id : <Skeleton width={120} />}
          </Typography>

          <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline' }}>
            <Stack
              direction="row"
              sx={{
                gap: 0.5,
                alignItems: 'center',
                flexGrow: 1,
                minWidth: 0,
                color: run && stateColor[run.state],
              }}
            >
              {run ? stateIcon[run.state] : null}
              <Typography variant="body2" color="inherit" noWrap>
                {run ? (
                  (stateLabel[run.state] ?? run.state)
                ) : (
                  <Skeleton width={70} />
                )}
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ gap: 1, alignItems: 'baseline' }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {run ? (
                  started ? (
                    formatDistanceToNow(started, { addSuffix: true })
                  ) : (
                    'not started'
                  )
                ) : (
                  <Skeleton width={90} />
                )}
              </Typography>
              {run && duration !== undefined ? (
                <Typography variant="caption" color="text.disabled" noWrap>
                  {`in ${formatRunLength(duration)}`}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
};
