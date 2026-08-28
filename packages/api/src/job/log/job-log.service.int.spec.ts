import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import { RETENTION_SECONDS } from 'src/job/job.constants';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { JobLogEntity } from './job-log.entity';
import { JobLogService } from './job-log.service';

const POSTGRES_IMAGE = 'postgres:17';

const RUN = '11111111-1111-4111-8111-111111111111';
const OTHER_RUN = '22222222-2222-4222-8222-222222222222';

let postgres: StartedPostgreSqlContainer;

const migrationFiles = (): string[] =>
  fs
    .readdirSync(path.join(__dirname, '..', '..', 'migration'))
    .filter((name) => /^\d+-.*\.ts$/.test(name))
    .sort()
    .map((name) => path.join(__dirname, '..', '..', 'migration', name));

const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe('JobLogService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: JobLogService;
  let logs: Repository<JobLogEntity>;
  let source: DataSource;

  const line = (jobId: string, at: Date): Promise<unknown> =>
    logs.insert({ jobId, at, level: 'info', context: null, record: {} });

  const remaining = async (): Promise<number> => logs.count();

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer(POSTGRES_IMAGE).start();

    const migrator = new DataSource({
      type: 'postgres',
      host: postgres.getHost(),
      port: postgres.getPort(),
      username: postgres.getUsername(),
      password: postgres.getPassword(),
      database: postgres.getDatabase(),
      migrations: migrationFiles(),
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    });

    await migrator.initialize();
    await migrator.runMigrations();
    await migrator.destroy();

    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgres.getHost(),
          port: postgres.getPort(),
          username: postgres.getUsername(),
          password: postgres.getPassword(),
          database: postgres.getDatabase(),
          entities: [JobLogEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([JobLogEntity]),
      ],
      providers: [JobLogService],
    }).compile();

    service = moduleRef.get(JobLogService);
    logs = moduleRef.get(getRepositoryToken(JobLogEntity));
    source = moduleRef.get(DataSource);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
    await postgres?.stop();
  });

  beforeEach(async () => {
    await source.query('TRUNCATE job_logs CASCADE');
  });

  const RETENTION_DAYS = RETENTION_SECONDS / (24 * 60 * 60);

  describe('pruning', () => {
    it('clears a line older than the retention window and its slack', async () => {
      await line(RUN, daysAgo(RETENTION_DAYS + 2));

      await expect(service.prune(100)).resolves.toBe(1);
      await expect(remaining()).resolves.toBe(0);
    });

    it('keeps a line inside the retention window', async () => {
      await line(RUN, daysAgo(RETENTION_DAYS - 1));

      await expect(service.prune(100)).resolves.toBe(0);
      await expect(remaining()).resolves.toBe(1);
    });

    it('keeps a line inside the slack that follows retention', async () => {
      await line(RUN, daysAgo(RETENTION_DAYS + 0.5));

      await expect(service.prune(100)).resolves.toBe(0);
      await expect(remaining()).resolves.toBe(1);
    });

    it('clears no more than the chunk it was handed', async () => {
      const old = daysAgo(RETENTION_DAYS + 2);
      await line(RUN, old);
      await line(RUN, old);
      await line(RUN, old);

      await expect(service.prune(2)).resolves.toBe(2);
      await expect(remaining()).resolves.toBe(1);
    });
  });

  describe('listing a run', () => {
    it('reads the newest line first', async () => {
      await line(RUN, daysAgo(2));
      await line(RUN, daysAgo(1));

      const read = await service.list(RUN);

      expect(read.map((entry) => entry.at.getTime())).toEqual(
        [...read].map((entry) => entry.at.getTime()).sort((a, b) => b - a),
      );
    });

    it('reads only the run it was asked for', async () => {
      await line(RUN, daysAgo(1));
      await line(OTHER_RUN, daysAgo(1));

      await expect(service.list(RUN)).resolves.toHaveLength(1);
    });
  });
});
