import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationParams } from 'src/common';
import { In, Repository } from 'typeorm';

import { JOB_TIMED_OUT_PREFIX, JobState, QUEUE_NAMES } from './job.constants';
import { JobDiscoveryService } from './job.discovery';
import { JobInfo, SchedulerInfo } from './job.dto';
import { PgBossJobEntity } from './pgboss-job.entity';

@Injectable()
export class JobService {
  constructor(
    private readonly discoveryService: JobDiscoveryService,
    @InjectRepository(PgBossJobEntity)
    private readonly jobRepository: Repository<PgBossJobEntity>,
  ) {}

  async list(pages?: PaginationParams): Promise<JobInfo[]> {
    const rows = await this.jobRepository.find({
      where: { name: In(QUEUE_NAMES) },
    });

    const allJobs = rows.map((row) => this.toJobInfo(row));

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

  private toJobInfo(row: PgBossJobEntity): JobInfo {
    const failedReason = row.output?.message
      ? row.output.message
      : row.output
        ? JSON.stringify(row.output)
        : undefined;

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
        return failedReason?.startsWith(JOB_TIMED_OUT_PREFIX)
          ? 'timedOut'
          : 'failed';
      default:
        return 'failed';
    }
  }
}
