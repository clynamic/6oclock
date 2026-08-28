import { MAX_API_LIMIT } from 'src/api/http/params';
import { AppealEntity } from 'src/appeal/appeal.entity';
import { AppealSyncService } from 'src/appeal/sync/appeal-sync.service';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TicketSyncService } from 'src/ticket/sync/ticket-sync.service';
import { TicketEntity } from 'src/ticket/ticket.entity';
import { UploadSyncService } from 'src/upload/sync/upload-sync.service';
import { Repository } from 'typeorm';

import { DateRange, TimeScale } from './date';

const at = (iso: string): Date => new Date(iso);

const spanning = (): DateRange =>
  new DateRange({
    startDate: at('2024-03-01T00:00:00Z'),
    endDate: at('2024-04-01T00:00:00Z'),
    scale: TimeScale.Day,
    timezone: 'UTC',
  });

type BuilderCalls = Record<string, unknown[][]>;

const recording = (
  rows: Record<string, string>[],
): { repository: Repository<never>; calls: BuilderCalls } => {
  const calls: BuilderCalls = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
      return builder;
    };

  const builder = {
    select: record('select'),
    addSelect: record('addSelect'),
    where: record('where'),
    andWhere: record('andWhere'),
    groupBy: record('groupBy'),
    orderBy: record('orderBy'),
    limit: record('limit'),
    offset: record('offset'),
    take: record('take'),
    skip: record('skip'),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  return {
    repository: {
      createQueryBuilder: () => builder,
      save: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
    } as unknown as Repository<never>,
    calls,
  };
};

const leaderboards: [
  string,
  (repository: Repository<never>) => Promise<number[]>,
  string,
][] = [
  [
    'ticket reporters',
    (repository) =>
      new TicketSyncService(
        repository as unknown as Repository<TicketEntity>,
      ).findReporters(spanning()),
    'reported',
  ],
  [
    'appeal creators',
    (repository) =>
      new AppealSyncService(
        repository as unknown as Repository<AppealEntity>,
      ).findAppellants(spanning()),
    'appealed',
  ],
  [
    'uploaders',
    (repository) =>
      new UploadSyncService(
        repository as unknown as Repository<PostVersionEntity>,
      ).findUploaders(spanning()),
    'uploaded',
  ],
];

describe('the leaderboards that sync jobs read', () => {
  it.each(leaderboards)(
    'reads %s as plain numbers, since the driver hands back strings',
    async (_name, run) => {
      const { repository } = recording([
        { user_id: '500' },
        { user_id: '501' },
      ]);

      await expect(run(repository)).resolves.toEqual([500, 501]);
    },
  );

  it.each(leaderboards)(
    'ranks %s by count, busiest first',
    async (_name, run, column) => {
      const { repository, calls } = recording([]);

      await run(repository);

      expect(calls['orderBy']![0]).toEqual([column, 'DESC']);
    },
  );

  it.each(leaderboards)(
    'caps %s with limit, since take does nothing on a raw query',
    async (_name, run) => {
      const { repository, calls } = recording([]);

      await run(repository);

      expect(calls['limit']![0]).toEqual([MAX_API_LIMIT]);
      expect(calls['take']).toBeUndefined();
    },
  );

  it.each(leaderboards)(
    'groups %s by account, so each appears once',
    async (_name, run) => {
      const { repository, calls } = recording([]);

      await run(repository);

      expect(calls['groupBy']).toHaveLength(1);
    },
  );

  it('counts only the first version as an upload', async () => {
    const { repository, calls } = recording([]);

    await new UploadSyncService(
      repository as unknown as Repository<PostVersionEntity>,
    ).findUploaders(spanning());

    expect((calls['andWhere'] ?? []).map((args) => String(args[0]))).toContain(
      'post_version.version = 1',
    );
  });

  it('asks for every uploader when no range narrows it', async () => {
    const { repository, calls } = recording([]);

    await new UploadSyncService(
      repository as unknown as Repository<PostVersionEntity>,
    ).findUploaders();

    expect(calls['where']![0]![0]).toEqual({});
  });
});
