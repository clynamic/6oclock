import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PgBoss } from 'pg-boss';
import { DataSource } from 'typeorm';

import { setActiveCheck } from './job.utils';

const REQUIRED_COLUMNS = [
  'id',
  'name',
  'state',
  'data',
  'start_after',
  'started_on',
  'completed_on',
  'output',
];

@Injectable()
export class JobBoss implements OnModuleDestroy {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private readonly logger = new Logger(JobBoss.name);
  private started = false;

  readonly instance = new PgBoss({
    host: process.env['DB_HOST'],
    port: process.env['DB_PORT'] ? parseInt(process.env['DB_PORT']) : 5432,
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_NAME'] || 'five_thirty',
  });

  async start(): Promise<void> {
    if (this.started) return;
    await this.instance.start();
    await this.verifySchema();
    setActiveCheck(async (job) => {
      const current = await this.instance.getJobById(job.name, job.id);
      return current?.state;
    });
    this.started = true;
    this.logger.log('pg-boss started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.started) await this.instance.stop();
  }

  private async verifySchema(): Promise<void> {
    const rows: { column_name: string }[] = await this.dataSource.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'pgboss' AND table_name = 'job'`,
    );
    const present = new Set(rows.map((row) => row.column_name));
    const missing = REQUIRED_COLUMNS.filter((column) => !present.has(column));
    if (missing.length) {
      throw new Error(
        `pgboss.job is missing expected columns: ${missing.join(', ')}. ` +
          'pg-boss schema drift; the job dashboard query depends on them.',
      );
    }
  }
}
