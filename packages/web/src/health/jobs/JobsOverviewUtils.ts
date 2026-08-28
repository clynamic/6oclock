import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';

import { JobInfo, JobOverview } from '../../api';

export type JobStanding = 'running' | 'erroring' | 'waiting';

export const getJobStanding = (job: JobOverview): JobStanding => {
  if (job.outcome === 'active') return 'running';
  if (job.errors) return 'erroring';
  return 'waiting';
};

const STANDING_ORDER: JobStanding[] = ['running', 'erroring', 'waiting'];

export const getJobFact = (job: JobOverview): string => {
  if (!job.ranAt) return 'not run yet';
  const since = formatDistanceToNow(job.ranAt, { addSuffix: true });

  switch (getJobStanding(job)) {
    case 'running':
      return `running for ${formatDistanceToNow(job.ranAt)}`;
    case 'erroring':
      return `errored ${since}`;
    default:
      return job.ranFor ? `${since} in ${formatRunLength(job.ranFor)}` : since;
  }
};

/** How long a run took, which is under a second for most of them. */
export const formatRunLength = (ms: number): string =>
  ms < 1000
    ? `${ms}ms`
    : formatDistanceStrict(0, ms, { unit: ms < 60000 ? 'second' : undefined });

export const sortJobs = (jobs?: JobOverview[]): JobOverview[] =>
  [...(jobs ?? [])].sort((a, b) => {
    const standing =
      STANDING_ORDER.indexOf(getJobStanding(a)) -
      STANDING_ORDER.indexOf(getJobStanding(b));
    if (standing) return standing;
    return (
      (a.ranAt ? new Date(a.ranAt).getTime() : 0) -
      (b.ranAt ? new Date(b.ranAt).getTime() : 0)
    );
  });

export const summarizeJobs = (jobs?: JobOverview[]): string | undefined => {
  if (!jobs) return undefined;
  const running = jobs.filter((job) => job.outcome === 'active');
  const erroring = jobs.filter((job) => job.enabled && job.errors);
  return [
    `${running.length} running`,
    erroring.length ? `${erroring.length} erroring` : undefined,
    `${jobs.filter((job) => job.enabled).length} schedulers`,
  ]
    .filter(Boolean)
    .join(', ');
};

export const runStarted = (run: JobInfo): Date | undefined =>
  run.startedAt ?? run.scheduledAt;

export const runDuration = (run: JobInfo): number | undefined =>
  run.endedAt && run.startedAt
    ? new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()
    : undefined;
