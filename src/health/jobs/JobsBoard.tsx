import { ArrowForward } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useJobs } from '../../api';
import { LimitedList, QueryHint } from '../../common';
import { JobsFrame } from './JobsFrame';

export const JobsDisplay = () => {
  const { data, isLoading, error } = useJobs(
    {
      limit: 10,
    },
    {
      query: {
        refetchInterval: 10000,
      },
    },
  );

  return (
    <QueryHint data={data} isLoading={isLoading} error={error}>
      <LimitedList
        indicator={() => (
          <Stack direction="row" justifyContent="flex-end">
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
        {data?.map((job) => <JobsFrame key={job.id} job={job} />)}
      </LimitedList>
    </QueryHint>
  );
};
