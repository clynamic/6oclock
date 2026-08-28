import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PostEventAction } from 'src/api';
import { CacheManager } from 'src/app/browser.module';
import { PaginationParams, PartialDateRange, TimeScale } from 'src/common';
import { LabelEntity } from 'src/label/label.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { SystemUserService } from 'src/user/system/system-user.service';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ApprovalCountSeriesQuery } from './approval-metric.dto';
import { ApprovalMetricService } from './approval-metric.service';

const TEST_DATABASE = 'six_oclock_test_approval';
const SYSTEM_USER_ID = 360277;

const POSTGRES_IMAGE = 'postgres:latest';

let postgres: StartedPostgreSqlContainer;

const adminDataSource = (): DataSource =>
  new DataSource({
    type: 'postgres',
    host: postgres.getHost(),
    port: postgres.getPort(),
    username: postgres.getUsername(),
    password: postgres.getPassword(),
    database: postgres.getDatabase(),
  });

const createTestDatabase = async (): Promise<void> => {
  const admin = adminDataSource();

  await admin.initialize();

  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DATABASE} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${TEST_DATABASE}`);
  await admin.query(`ALTER DATABASE ${TEST_DATABASE} SET timezone TO 'UTC'`);
  await admin.destroy();
};

const dropTestDatabase = async (): Promise<void> => {
  const admin = adminDataSource();
  await admin.initialize();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DATABASE} WITH (FORCE)`);
  await admin.destroy();
};

const at = (iso: string): Date => new Date(iso);

const daily = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

describe('ApprovalMetricService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: ApprovalMetricService;
  let repository: Repository<PostEventEntity>;
  let nextId = 1;

  const event = (
    postId: number,
    creatorId: number,
    action: PostEventAction,
    iso: string,
  ): Promise<unknown> =>
    repository.insert({
      id: nextId++,
      postId,
      creatorId,
      action,
      createdAt: at(iso),
    });

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
    await createTestDatabase();

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgres.getHost(),
          port: postgres.getPort(),
          username: postgres.getUsername(),
          password: postgres.getPassword(),
          database: TEST_DATABASE,
          entities: [PostEventEntity, LabelEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([PostEventEntity]),
      ],
      providers: [
        CacheManager,
        ApprovalMetricService,
        {
          provide: SystemUserService,
          useValue: {
            id: SYSTEM_USER_ID,
            isSystem: (userId?: number) => userId === SYSTEM_USER_ID,
          },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(ApprovalMetricService);
    repository = moduleRef.get(getRepositoryToken(PostEventEntity));
  }, 60000);

  afterAll(async () => {
    await moduleRef?.close();
    await dropTestDatabase();
    await postgres?.stop();
  }, 60000);

  beforeEach(async () => {
    await repository.clear();
    await CacheManager.getInstance().clear();
  });

  describe('countSummary', () => {
    it('counts a post whose last event in the window is an approval', async () => {
      await event(1, 500, PostEventAction.approved, '2024-01-02T00:00:00Z');

      const summary = await service.countSummary(
        daily('2024-01-01T00:00:00Z', '2024-01-08T00:00:00Z'),
      );

      expect(summary.total).toBe(1);
    });

    it('leaves out a post that was approved and then unapproved', async () => {
      await event(2, 500, PostEventAction.approved, '2024-02-02T00:00:00Z');
      await event(2, 500, PostEventAction.unapproved, '2024-02-04T00:00:00Z');

      const summary = await service.countSummary(
        daily('2024-02-01T00:00:00Z', '2024-02-08T00:00:00Z'),
      );

      expect(summary.total).toBe(0);
    });

    it('counts a post that was unapproved and then approved again', async () => {
      await event(3, 500, PostEventAction.unapproved, '2024-03-02T00:00:00Z');
      await event(3, 500, PostEventAction.approved, '2024-03-04T00:00:00Z');

      const summary = await service.countSummary(
        daily('2024-03-01T00:00:00Z', '2024-03-08T00:00:00Z'),
      );

      expect(summary.total).toBe(1);
    });

    it('counts each post once, however many times it was approved', async () => {
      await event(4, 500, PostEventAction.approved, '2024-04-02T00:00:00Z');
      await event(4, 500, PostEventAction.unapproved, '2024-04-03T00:00:00Z');
      await event(4, 500, PostEventAction.approved, '2024-04-04T00:00:00Z');

      const summary = await service.countSummary(
        daily('2024-04-01T00:00:00Z', '2024-04-08T00:00:00Z'),
      );

      expect(summary.total).toBe(1);
    });

    it('reads only the window, so an unapproval after it does not undo the count', async () => {
      await event(5, 500, PostEventAction.approved, '2024-05-02T00:00:00Z');
      await event(5, 500, PostEventAction.unapproved, '2024-06-02T00:00:00Z');

      const summary = await service.countSummary(
        daily('2024-05-01T00:00:00Z', '2024-05-08T00:00:00Z'),
      );

      expect(summary.total).toBe(1);
    });
  });

  describe('countSeries', () => {
    it('places the approval on the day of the last event, not the first', async () => {
      await event(6, 500, PostEventAction.unapproved, '2024-07-02T00:00:00Z');
      await event(6, 500, PostEventAction.approved, '2024-07-04T00:00:00Z');

      const series = await service.countSeries(
        daily('2024-07-01T00:00:00Z', '2024-07-08T00:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([0, 0, 0, 1, 0, 0, 0]);
    });

    it('narrows to one approver when asked for one', async () => {
      await event(7, 500, PostEventAction.approved, '2024-08-02T00:00:00Z');
      await event(8, 501, PostEventAction.approved, '2024-08-02T00:00:00Z');

      const series = await service.countSeries(
        daily('2024-08-01T00:00:00Z', '2024-08-08T00:00:00Z'),
        new ApprovalCountSeriesQuery({ userId: 500 }),
      );

      expect(series.reduce((sum, point) => sum + point.value, 0)).toBe(1);
    });

    it('leaves out a post whose last event in the window is an unapproval', async () => {
      await event(50, 500, PostEventAction.approved, '2024-08-20T00:00:00Z');
      await event(50, 500, PostEventAction.unapproved, '2024-08-22T00:00:00Z');

      const series = await service.countSeries(
        daily('2024-08-19T00:00:00Z', '2024-08-26T00:00:00Z'),
      );

      expect(series.reduce((sum, point) => sum + point.value, 0)).toBe(0);
    });

    it('keeps the automated account in the approval count', async () => {
      await event(
        9,
        SYSTEM_USER_ID,
        PostEventAction.approved,
        '2024-09-02T00:00:00Z',
      );

      const series = await service.countSeries(
        daily('2024-09-01T00:00:00Z', '2024-09-08T00:00:00Z'),
      );

      expect(series.reduce((sum, point) => sum + point.value, 0)).toBe(1);
    });
  });

  describe('approverSummary', () => {
    it('drops the automated account from the leaderboard', async () => {
      await event(
        10,
        SYSTEM_USER_ID,
        PostEventAction.approved,
        '2024-10-02T00:00:00Z',
      );
      await event(11, 500, PostEventAction.approved, '2024-10-02T00:00:00Z');

      const summaries = await service.approverSummary(
        daily('2024-10-01T00:00:00Z', '2024-10-08T00:00:00Z'),
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([500]);
    });

    it('ranks approvers by how many posts they approved', async () => {
      await event(12, 500, PostEventAction.approved, '2024-11-02T00:00:00Z');
      await event(13, 500, PostEventAction.approved, '2024-11-03T00:00:00Z');
      await event(14, 501, PostEventAction.approved, '2024-11-02T00:00:00Z');

      const summaries = await service.approverSummary(
        daily('2024-11-01T00:00:00Z', '2024-11-08T00:00:00Z'),
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([500, 501]);
      expect(summaries.map((summary) => Number(summary.total))).toEqual([2, 1]);
      expect(summaries.map((summary) => Number(summary.position))).toEqual([
        1, 2,
      ]);
    });

    it('counts the days an approver worked, not the posts they approved', async () => {
      await event(15, 500, PostEventAction.approved, '2024-12-02T01:00:00Z');
      await event(16, 500, PostEventAction.approved, '2024-12-02T23:00:00Z');
      await event(17, 500, PostEventAction.approved, '2024-12-03T01:00:00Z');

      const summaries = await service.approverSummary(
        daily('2024-12-01T00:00:00Z', '2024-12-08T00:00:00Z'),
      );

      expect(Number(summaries[0]!.days)).toBe(2);
      expect(Number(summaries[0]!.total)).toBe(3);
    });

    it('credits nobody for a post whose last event was an unapproval', async () => {
      await event(18, 500, PostEventAction.approved, '2025-01-02T00:00:00Z');
      await event(18, 501, PostEventAction.unapproved, '2025-01-03T00:00:00Z');

      const summaries = await service.approverSummary(
        daily('2025-01-01T00:00:00Z', '2025-01-08T00:00:00Z'),
      );

      expect(summaries).toEqual([]);
    });

    it('hands back only the page that was asked for', async () => {
      await event(19, 500, PostEventAction.approved, '2025-02-02T00:00:00Z');
      await event(20, 500, PostEventAction.approved, '2025-02-03T00:00:00Z');
      await event(21, 501, PostEventAction.approved, '2025-02-02T00:00:00Z');

      const summaries = await service.approverSummary(
        daily('2025-02-01T00:00:00Z', '2025-02-08T00:00:00Z'),
        new PaginationParams({ page: 2, limit: 1 }),
      );

      expect(summaries.map((summary) => summary.userId)).toEqual([501]);
    });
  });
});
