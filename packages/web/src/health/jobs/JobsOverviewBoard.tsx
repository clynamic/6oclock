import { ArrowForward } from '@mui/icons-material';
import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import { useJobOverview } from '../../api';
import { LimitedList } from '../../common/LimitedList';
import { QueryHint } from '../../common/QueryHint';
import { JobsOverviewFrame } from './JobsOverviewFrame';
import { sortJobs, summarizeJobs } from './JobsOverviewUtils';

export const JobsOverviewDisplay = () => {
  const { data, isLoading, error } = useJobOverview({
    query: {
      refetchInterval: 10000,
    },
  });

  const jobs = sortJobs(data?.filter((job) => job.enabled));

  return (
    <QueryHint
      data={data}
      isLoading={isLoading}
      isEmpty={!data?.length}
      error={error}
      skeleton={
        <Stack sx={{ gap: 1 }}>
          <Typography variant="body2">
            <Skeleton width="60%" />
          </Typography>
          <LimitedList>
            {Array.from({ length: 3 }).map((_, index) => (
              <JobsOverviewFrame key={index} />
            ))}
          </LimitedList>
        </Stack>
      }
    >
      <Stack sx={{ gap: 1, height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          {summarizeJobs(data)}
        </Typography>
        <LimitedList
          indicator={() => (
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                component={Link}
                to="/health/jobs"
              >
                See All
              </Button>
            </Stack>
          )}
        >
          {jobs.map((job) => (
            <JobsOverviewFrame key={job.id} job={job} />
          ))}
        </LimitedList>
      </Stack>
    </QueryHint>
  );
};
