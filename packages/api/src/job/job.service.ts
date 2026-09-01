import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationParams } from 'src/common';
import { In, Repository } from 'typeorm';

import {
  JOB_EXPIRED_MESSAGE,
  JOB_TIMED_OUT_PREFIX,
  JobOutput,
  JobState,
  QUEUE_NAMES,
  RECENT_RUNS,
  getJobFailure,
} from './job.constants';
import { JobDiscoveryService } from './job.discovery';
import { JobInfo, JobOverview, SchedulerInfo } from './job.dto';
import { PgBossJobEntity } from './pgboss-job.entity';

@Injectable()
export class JobService {
  constructor(
    private readonly discoveryService: JobDiscoveryService,
    @InjectRepository(PgBossJobEntity)
    private readonly jobRepository: Repository<PgBossJobEntity>,
  ) {}

  async overview(): Promise<JobOverview[]> {
    const rows: {
      handler_id: string;
      state: string;
      started_on: Date | null;
      completed_on: Date | null;
      output: JobOutput | null;
      // eslint-disable-next-line no-restricted-syntax -- window function
    }[] = await this.jobRepository.query(
      `
      SELECT handler_id, state, started_on, completed_on, output
      FROM (
        SELECT
          j.data->>'handlerId' AS handler_id,
          j.state,
          j.started_on,
          j.completed_on,
          j.output,
          row_number() OVER (
            PARTITION BY j.data->>'handlerId'
            ORDER BY coalesce(j.completed_on, j.started_on) DESC
          ) AS recency
        FROM pgboss.job j
        WHERE j.data->>'handlerId' IS NOT NULL AND j.started_on IS NOT NULL
      ) ranked
      WHERE recency <= $1
      ORDER BY handler_id, recency
      `,
      [RECENT_RUNS],
    );

    const history = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = history.get(row.handler_id);
      if (list) list.push(row);
      else history.set(row.handler_id, [row]);
    }

    return this.listSchedulers().map((scheduler) => {
      const runs = history.get(scheduler.id) ?? [];
      const recent = runs.map((run) =>
        this.mapState(run.state, getJobFailure(run.output)),
      );

      const last = runs[0];
      const succeeded = runs[recent.indexOf('completed')];
      const errors = recent.findIndex((state) => state !== 'failed');

      return new JobOverview({
        id: scheduler.id,
        description: scheduler.description,
        queue: scheduler.queue,
        pattern: scheduler.pattern,
        enabled: scheduler.enabled,
        outcome: recent[0],
        ranAt: last?.started_on ?? undefined,
        ranFor:
          last?.completed_on && last.started_on
            ? last.completed_on.getTime() - last.started_on.getTime()
            : undefined,
        failedReason: getJobFailure(last?.output),
        succeededAt: succeeded?.completed_on ?? undefined,
        recent,
        errors: errors < 0 ? recent.length : errors,
      });
    });
  }

  async list(pages?: PaginationParams, handler?: string): Promise<JobInfo[]> {
    const rows = await this.jobRepository.find({
      where: { name: In(QUEUE_NAMES) },
    });

    const allJobs = rows
      .map((row) => this.toJobInfo(row))
      .filter((job) => !handler || job.name === handler);

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
          description: entry.options.description,
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

  private toJobInfo(row: PgBossJobEntity): JobInfo {
    const failedReason =
      getJobFailure(row.output) ??
      (row.output ? JSON.stringify(row.output) : undefined);

    return new JobInfo({
      id: row.id,
      name: row.data?.handlerId ?? row.name,
      queue: row.name,
      state: this.mapState(row.state, failedReason),
      scheduledAt: row.startAfter ?? undefined,
      startedAt: row.startedOn ?? undefined,
      endedAt: row.completedOn ?? undefined,
      failedReason,
    });
  }

  private mapState(pgState: string, failedReason?: string): JobState {
    switch (pgState) {
      case 'active':
        return 'active';
      case 'created':
        return 'waiting';
      case 'retry':
        return 'delayed';
      case 'completed':
        return 'completed';
      case 'failed':
        return failedReason?.startsWith(JOB_TIMED_OUT_PREFIX) ||
          failedReason === JOB_EXPIRED_MESSAGE
          ? 'timedOut'
          : 'failed';
      default:
        return 'failed';
    }
  }
}
