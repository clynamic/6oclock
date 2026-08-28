import { Box, Stack, Typography } from '@mui/material';

import { useJobOverview } from '../../api';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageFooter } from '../../page/PageFooter';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { JobsOverviewFrame } from './JobsOverviewFrame';
import { sortJobs, summarizeJobs } from './JobsOverviewUtils';

export const JobsPage: React.FC = () => {
  const { data, isLoading, error } = useJobOverview({
    query: { refetchInterval: 10000 },
  });

  const running = sortJobs(data?.filter((job) => job.enabled));
  const disabled = data?.filter((job) => !job.enabled) ?? [];

  return (
    <Page>
      <PageTitle subtitle="Jobs" />
      <PageHeader />
      <PageBody>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            marginInline: 'auto',
            p: 2,
            alignSelf: 'flex-start',
          }}
        >
          <QueryHint
            data={data}
            isLoading={isLoading}
            isEmpty={!data?.length}
            error={error}
            skeleton={
              <Stack sx={{ gap: 1 }}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <JobsOverviewFrame key={index} />
                ))}
              </Stack>
            }
          >
            <Stack sx={{ gap: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {summarizeJobs(data)}
                </Typography>
                {running.map((job) => (
                  <JobsOverviewFrame key={job.id} job={job} />
                ))}
              </Stack>

              {disabled.length ? (
                <Stack sx={{ gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Disabled
                  </Typography>
                  {disabled.map((job) => (
                    <JobsOverviewFrame key={job.id} job={job} />
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </QueryHint>
        </Box>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
