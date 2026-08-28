import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sub } from 'date-fns';
import { PaginationParams } from 'src/common';
import { RETENTION_SECONDS } from 'src/job/job.constants';
import { QueryDeepPartialEntity, Repository } from 'typeorm';

import { JobLogEntity } from './job-log.entity';
import { JobLogRecord, closeJobLog, openJobLog } from './job-log.sink';

// A crash loses whatever is still buffered.
const BATCH_SIZE = 100;

const FLUSH_INTERVAL_MS = 2 * 1000;

type JobLogRow = Pick<
  JobLogEntity,
  'jobId' | 'at' | 'level' | 'context' | 'record'
>;

// pg-boss counts retention from completion, later than any line's own time.
const PRUNE_SLACK_SECONDS = 24 * 60 * 60;

@Injectable()
export class JobLogService {
  constructor(
    @InjectRepository(JobLogEntity)
    private readonly logRepository: Repository<JobLogEntity>,
  ) {}

  collect(jobId: string): { close: () => Promise<void> } {
    let buffer: JobLogRow[] = [];
    let writing: Promise<void> = Promise.resolve();

    const drain = () => {
      if (buffer.length === 0) return;
      const batch = buffer;
      buffer = [];
      writing = writing.then(() =>
        this.logRepository
          .createQueryBuilder()
          .insert()
          .into(JobLogEntity)
          // TypeORM's insert type recurses into the jsonb column.
          .values(batch as QueryDeepPartialEntity<JobLogEntity>[])
          .execute()
          .then(() => undefined)
          .catch(() => undefined),
      );
    };

    const ticker = setInterval(drain, FLUSH_INTERVAL_MS);
    ticker.unref();

    openJobLog(jobId, (line: JobLogRecord) => {
      buffer.push({ jobId, ...line, context: line.context ?? null });
      if (buffer.length >= BATCH_SIZE) drain();
    });

    return {
      close: async () => {
        clearInterval(ticker);
        closeJobLog(jobId);
        drain();
        await writing;
      },
    };
  }

  async list(jobId: string, pages?: PaginationParams): Promise<JobLogEntity[]> {
    return this.logRepository.find({
      where: { jobId },
      order: { id: 'DESC' },
      skip: PaginationParams.calculateOffset(pages),
      take: pages?.limit ?? PaginationParams.DEFAULT_PAGE_SIZE,
    });
  }

  async prune(limit: number): Promise<number> {
    const cutOff = sub(new Date(), {
      seconds: RETENTION_SECONDS + PRUNE_SLACK_SECONDS,
    });

    const result: [unknown[], number] = await this.logRepository.query(
      `
      DELETE FROM job_logs
      WHERE id IN (
        SELECT id FROM job_logs WHERE at < $1 ORDER BY id LIMIT $2
      )
      `,
      [cutOff, limit],
    );

    return result[1] ?? 0;
  }
}
