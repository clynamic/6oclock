import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaginationParams } from 'src/common';

import { JOB_TIMED_OUT_PREFIX, JobState, QUEUE_NAMES } from './job.constants';
import { JobDiscoveryService } from './job.discovery';
import { JobInfo, SchedulerInfo } from './job.dto';

@Injectable()
export class JobService {
  constructor(private readonly discoveryService: JobDiscoveryService) {}

  async list(pages?: PaginationParams): Promise<JobInfo[]> {
    const allJobs: JobInfo[] = [];

    for (const queueName of QUEUE_NAMES) {
      const queue = this.discoveryService.getQueue(queueName);
      const jobs = await queue.getJobs([
        'completed',
        'failed',
        'active',
        'waiting',
        'delayed',
      ]);

      for (const job of jobs) {
        allJobs.push(await this.toJobInfo(job, queueName));
      }
    }

    const offset = PaginationParams.calculateOffset(pages);
    const limit = pages?.limit ?? PaginationParams.DEFAULT_PAGE_SIZE;

    const stateOrder: Record<string, number> = {
      active: 0,
      waiting: 1,
      delayed: 1,
      completed: 2,
      failed: 2,
      timedOut: 2,
    };

    return allJobs
      .sort((a, b) => {
        const groupA = stateOrder[a.state] ?? 2;
        const groupB = stateOrder[b.state] ?? 2;
        if (groupA !== groupB) return groupA - groupB;

        if (groupA === 1) {
          return (
            (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0)
          );
        }

        return (
          (b.endedAt?.getTime() ?? b.startedAt?.getTime() ?? 0) -
          (a.endedAt?.getTime() ?? a.startedAt?.getTime() ?? 0)
        );
      })
      .slice(offset, offset + limit);
  }

  listSchedulers(): SchedulerInfo[] {
    return this.discoveryService.getEntries().map(
      (entry) =>
        new SchedulerInfo({
          id: entry.options.id,
          queue: entry.options.queue,
          pattern: entry.options.pattern,
          enabled: entry.options.enabled,
        }),
    );
  }

  async enableScheduler(id: string): Promise<void> {
    await this.discoveryService.enableScheduler(id);
  }

  async disableScheduler(id: string): Promise<void> {
    await this.discoveryService.disableScheduler(id);
  }

  private async toJobInfo(job: Job, queue: string): Promise<JobInfo> {
    const rawState = await job.getState();
    const state: JobState =
      rawState === 'failed' &&
      job.failedReason?.startsWith(JOB_TIMED_OUT_PREFIX)
        ? 'timedOut'
        : (rawState as JobState);

    return new JobInfo({
      id: job.id ?? '',
      name: job.name,
      queue,
      state,
      scheduledAt: new Date(job.timestamp + (job.delay ?? 0)),
      startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      endedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      failedReason: job.failedReason ?? undefined,
    });
  }
}
