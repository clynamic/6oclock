import { useEffect, useState } from 'react';

import { Download } from '@mui/icons-material';
import {
  Box,
  Card,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

import { JobInfo, jobLogs, useJobLogsInfinite } from '../../api';
import { ErrorHint } from '../../common/ErrorHint';
import { FactList } from '../../common/FactList';
import { LoadMoreHint } from '../../common/LoadMoreHint';
import { JobLogFilter } from './JobLogFilter';
import { JobLogLine } from './JobLogLine';
import { formatRunLength, runDuration, runStarted } from './JobsOverviewUtils';

/** The largest page the api accepts, so a talkative run needs fewer round trips. */
const PAGE_SIZE = 320;

export interface JobLogPaneProps {
  run?: JobInfo;

  /** What to say when there is no run to read, in the run's own words. */
  empty?: string;
}

const silence: Record<string, string> = {
  waiting: 'Queued',
  delayed: 'Scheduled',
  active: 'No output yet',
};

/** Levels the upstream chatter sits at, hidden until someone asks for it. */
export const JobLogPane: React.FC<JobLogPaneProps> = ({ run, empty }) => {
  const started = run && runStarted(run);
  const duration = run && runDuration(run);

  const [hidden, setHidden] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // The pane holds only the pages that were scrolled to, and a file that stops
  // where the reader stopped is a trap.
  const download = async () => {
    if (!run) return;

    setSaving(true);

    try {
      const all = [];
      let before: string | undefined;

      for (;;) {
        const page = await jobLogs(run.id, { limit: PAGE_SIZE, before });

        all.push(...page);
        if (page.length < PAGE_SIZE) break;

        before = page[page.length - 1]!.id;
      }

      const url = URL.createObjectURL(
        new Blob(
          [
            all
              .reverse()
              .map((line) => JSON.stringify(line))
              .join('\n'),
          ],
          { type: 'application/jsonl' },
        ),
      );

      const link = document.createElement('a');

      link.href = url;
      link.download = `${run.id}.jsonl`;
      link.click();

      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

  const logs = useJobLogsInfinite(
    run?.id ?? '',
    { limit: PAGE_SIZE },
    {
      query: {
        enabled: !!run && run.state !== 'waiting' && run.state !== 'delayed',
        refetchInterval: run?.state === 'active' ? 5000 : undefined,
        initialPageParam: undefined,
        getNextPageParam: (last) =>
          last.length < PAGE_SIZE ? undefined : last[last.length - 1]?.id,
      },
    },
  );

  // Polling stops the moment the run leaves active, which would strand
  // whatever it wrote after the last tick.
  const settled = run && run.state !== 'active';
  const refetch = logs.refetch;

  useEffect(() => {
    if (settled) refetch();
  }, [settled, refetch]);

  const lines = logs.data?.pages.flat() ?? [];
  const shown = hidden.length
    ? lines.filter((line) => !hidden.includes(line.level))
    : lines;

  if (!run) {
    return (
      <Stack
        sx={{
          flex: 1,
          backgroundColor: 'background.default',
          borderRadius: 1,
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontFamily: 'monospace' }}
        >
          {empty ?? 'No runs recorded'}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 1, flex: 1, minHeight: 0, minWidth: 0 }}>
      <Card sx={{ p: 2, flexShrink: 0, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            minWidth: 0,
          }}
        >
          <FactList
            facts={[
              {
                label: 'Started',
                value: started
                  ? formatDistanceToNow(started, { addSuffix: true })
                  : 'not yet',
              },
              {
                label: 'Took',
                value:
                  duration !== undefined
                    ? formatRunLength(duration)
                    : started
                      ? 'still running'
                      : 'not yet',
              },
              { label: 'Queue', value: run.queue },
              {
                label: 'Run',
                value: (
                  <Box component="span" sx={{ fontFamily: 'monospace' }}>
                    {run.id}
                  </Box>
                ),
              },
            ]}
          />
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Tooltip title="Download the whole run">
              <span>
                <IconButton
                  size="small"
                  onClick={download}
                  disabled={saving || !lines.length}
                >
                  <Download fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <JobLogFilter hidden={hidden} onChange={setHidden} />
          </Stack>
        </Stack>
      </Card>

      <Stack
        sx={{
          gap: 1,
          backgroundColor: 'background.default',
          borderRadius: 1,
          p: 1.5,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'auto',
        }}
      >
        {run.failedReason ? (
          <Stack
            sx={{
              borderLeft: '4px solid',
              borderLeftColor: 'error.main',
              pl: 1.5,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'error.main', lineHeight: 1.6 }}
            >
              Failed
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {run.failedReason}
            </Typography>
          </Stack>
        ) : null}

        {logs.error ? <ErrorHint error={logs.error} /> : null}

        {logs.isLoading ? (
          <Stack sx={{ gap: 0.5 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} width={`${90 - index * 8}%`} />
            ))}
          </Stack>
        ) : null}

        {!logs.isLoading && !shown.length ? (
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', fontFamily: 'monospace' }}
          >
            {lines.length
              ? 'No lines at these levels'
              : (silence[run.state] ?? 'No output')}
          </Typography>
        ) : null}

        <Stack sx={{ gap: 0.25, minWidth: 0 }}>
          {shown.map((line) => (
            <JobLogLine key={line.id} line={line} />
          ))}
          {lines.length ? <LoadMoreHint query={logs} /> : null}
        </Stack>
      </Stack>
    </Stack>
  );
};
