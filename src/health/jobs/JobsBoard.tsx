import { ArrowForward } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { useJobs } from '../../api';
import { LimitedList, NoDataHint } from '../../common';
import { JobsFrame } from './JobsFrame';

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
            to="/health/jobs"
          >
            See All
          </Button>
        </Stack>
      )}
    >
      {data.map((job) => (
        <JobsFrame key={job.id} job={job} />
      ))}
    </LimitedList>
  );
};
