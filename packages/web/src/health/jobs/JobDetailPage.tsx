import { useCallback, useEffect } from 'react';

import { ArrowBack, Pause, PlayArrow } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import cronstrue from 'cronstrue';
import { useParams, useSearchParams } from 'react-router';

import {
  JobInfo,
  getJobOverviewQueryKey,
  useJobOverview,
  useJobs,
  useSetJobScheduler,
} from '../../api';
import { FactList } from '../../common/FactList';
import { QueryHint } from '../../common/QueryHint';
import { Page } from '../../page/Page';
import { PageBody } from '../../page/PageBody';
import { PageTitle } from '../../page/PageTitle';
import { PageHeader } from '../../page/header/PageHeader';
import { JobLogPane } from './JobLogPane';
import { JobRunFrame } from './JobRunFrame';
import { getJobFact, runStarted } from './JobsOverviewUtils';

const runAt = (run: JobInfo): number =>
  new Date(run.endedAt ?? runStarted(run) ?? 0).getTime();

export const JobDetailPage: React.FC = () => {
  const id = useParams()['*'] ?? '';

  // The run rides the query, so the back gesture leaves the log before the job.
  const [params, setParams] = useSearchParams();
  const selected = params.get('run') ?? undefined;

  const select = useCallback(
    (value?: string, options?: { replace?: boolean }) => {
      const next = new URLSearchParams(params);

      if (value) next.set('run', value);
      else next.delete('run');

      setParams(next, options);
    },
    [params, setParams],
  );

  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const queryClient = useQueryClient();
  const overview = useJobOverview({ query: { refetchInterval: 10000 } });
  const scheduler = overview.data?.find((job) => job.id === id);

  const setScheduler = useSetJobScheduler();

  const toggle = async () => {
    if (!scheduler) return;

    await setScheduler.mutateAsync({
      data: { id, enabled: !scheduler.enabled },
    });
    await queryClient.invalidateQueries({ queryKey: getJobOverviewQueryKey() });
  };

  const runs = useJobs(
    { handler: id, limit: 20 },
    { query: { refetchInterval: 10000 } },
  );

  const pending = (runs.data ?? []).filter(
    (item) => item.state === 'waiting' || item.state === 'delayed',
  );
  const history = (runs.data ?? [])
    .filter((item) => !pending.includes(item))
    .sort((a, b) => runAt(b) - runAt(a));
  const listed = [...pending, ...history];
  const run = listed.find((item) => item.id === selected) ?? history[0];

  // The pane opens on a run either way, so the address should name it. On a
  // narrow screen the list is the screen, and naming one would skip past it.
  useEffect(() => {
    if (compact || selected || !run) return;

    select(run.id, { replace: true });
  }, [compact, selected, run, select]);

  return (
    <Page>
      <PageTitle subtitle={id} />
      <PageHeader />
      <PageBody>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1600,
            marginInline: 'auto',
            p: 2,
            alignSelf: 'flex-start',
          }}
        >
          <Stack sx={{ gap: 2 }}>
            <Card sx={{ p: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{ flexGrow: 1, minWidth: 0 }}
                  >
                    {id}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color={scheduler?.enabled ? 'inherit' : 'primary'}
                    sx={{
                      flexShrink: 0,
                      ...(scheduler?.enabled
                        ? {
                            color: 'text.secondary',
                            borderColor: 'divider',
                            '&:hover': {
                              color: 'error.main',
                              borderColor: 'error.main',
                            },
                          }
                        : {}),
                    }}
                    startIcon={scheduler?.enabled ? <Pause /> : <PlayArrow />}
                    disabled={!scheduler || setScheduler.isPending}
                    onClick={toggle}
                  >
                    {scheduler?.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </Stack>
                <QueryHint
                  isEmpty={!overview.isLoading && !scheduler}
                  error={overview.error}
                >
                  <Stack sx={{ gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {scheduler?.description}
                    </Typography>
                    <FactList
                      facts={[
                        { label: 'Queue', value: scheduler?.queue },
                        {
                          label: 'Cadence',
                          value: scheduler
                            ? cronstrue
                                .toString(scheduler.pattern, { verbose: false })
                                .toLowerCase()
                            : undefined,
                        },
                        {
                          label: 'Last run',
                          value: scheduler
                            ? scheduler.enabled
                              ? getJobFact(scheduler)
                              : 'disabled'
                            : undefined,
                        },
                      ]}
                    />
                  </Stack>
                </QueryHint>
              </Stack>
            </Card>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{ gap: 2, alignItems: 'flex-start' }}
            >
              <Stack
                sx={{
                  gap: 1,
                  width: { xs: '100%', md: 320 },
                  flexShrink: 0,
                  display: compact && selected ? 'none' : 'flex',
                }}
              >
                <QueryHint
                  data={runs.data}
                  isLoading={runs.isLoading}
                  error={runs.error}
                  skeleton={
                    <Stack sx={{ gap: 1 }}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <JobRunFrame key={index} />
                      ))}
                    </Stack>
                  }
                >
                  {listed.map((item) => (
                    <JobRunFrame
                      key={item.id}
                      run={item}
                      selected={item.id === run?.id}
                      onSelect={() => select(item.id)}
                    />
                  ))}
                </QueryHint>
              </Stack>

              <Stack
                sx={{
                  gap: 1,
                  flex: 1,
                  minWidth: 0,
                  width: { xs: '100%', md: 'auto' },
                  position: { md: 'sticky' },
                  top: 16,
                  alignSelf: 'flex-start',
                  display: compact && !selected ? 'none' : 'flex',
                  height: { md: 'calc(100vh - 32px)' },
                }}
              >
                {compact ? (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<ArrowBack />}
                    onClick={() => select(undefined)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Runs
                  </Button>
                ) : null}
                {compact && !selected ? null : (
                  <JobLogPane
                    run={run}
                    empty={
                      scheduler && !scheduler.enabled
                        ? 'Disabled'
                        : pending.length
                          ? 'Not run yet'
                          : 'No runs'
                    }
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </PageBody>
      {/* A footer would push the log pane into a scroll. */}
    </Page>
  );
};
