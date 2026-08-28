import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { PaginationParams, PartialDateRange, TimeScale } from 'src/common';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { UploadTilesEntity } from 'src/upload/tiles/upload-tiles.entity';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';

import { UploadMetricService } from './upload-metric.service';

type BuilderCalls = Record<string, unknown[][]>;

const createBuilder = (): { builder: unknown; calls: BuilderCalls } => {
  const calls: BuilderCalls = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
      return builder;
    };

  const builder = {
    where: record('where'),
    andWhere: record('andWhere'),
    select: record('select'),
    addSelect: record('addSelect'),
    groupBy: record('groupBy'),
    orderBy: record('orderBy'),
    take: record('take'),
    skip: record('skip'),
    limit: record('limit'),
    offset: record('offset'),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  return { builder, calls };
};

const at = (iso: string): Date => new Date(iso);

const inRange = (
  operator: unknown,
  startIso: string,
  endIso: string,
): boolean => {
  const both = operator as { type?: string; value?: unknown } | undefined;
  if (both?.type !== 'and') return false;

  const [after, before] = both.value as [
    { type: string; value: Date },
    { type: string; value: Date },
  ];

  return (
    after?.type === 'moreThanOrEqual' &&
    before?.type === 'lessThan' &&
    after.value.getTime() === at(startIso).getTime() &&
    before.value.getTime() === at(endIso).getTime()
  );
};

const hourly = (start: string, end: string): PartialDateRange =>
  new PartialDateRange({
    startDate: at(start),
    endDate: at(end),
    scale: TimeScale.Hour,
    timezone: 'UTC',
  });

describe('UploadMetricService', () => {
  let service: UploadMetricService;
  let tileFind: jest.Mock;
  let versionFind: jest.Mock;
  let versionBuilder: { builder: unknown; calls: BuilderCalls };

  beforeEach(async () => {
    tileFind = jest.fn().mockResolvedValue([]);
    versionFind = jest.fn().mockResolvedValue([]);
    versionBuilder = createBuilder();

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        UploadMetricService,
        {
          provide: getRepositoryToken(UploadTilesEntity),
          useValue: { find: tileFind },
        },
        {
          provide: getRepositoryToken(PostVersionEntity),
          useValue: {
            find: versionFind,
            createQueryBuilder: () => versionBuilder.builder,
          },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(UploadMetricService);
    await CacheManager.getInstance().clear();
  });

  describe('count', () => {
    it('reads the hourly tiles of the window in time order', async () => {
      await service.count(
        hourly('2024-01-01T00:00:00Z', '2024-01-01T04:00:00Z'),
      );

      const options = tileFind.mock
        .calls[0]![0] as FindManyOptions<UploadTilesEntity>;
      const where = options.where as FindOptionsWhere<UploadTilesEntity>;

      expect(options.order).toEqual({ time: 'ASC' });
      expect(
        inRange(where.time, '2024-01-01T00:00:00Z', '2024-01-01T04:00:00Z'),
      ).toBe(true);
    });

    it('adds up every tile that falls in one bucket', async () => {
      tileFind.mockResolvedValue([
        new UploadTilesEntity({ time: at('2024-02-01T00:00:00Z'), count: 3 }),
        new UploadTilesEntity({ time: at('2024-02-01T01:00:00Z'), count: 4 }),
      ]);

      const series = await service.count(
        new PartialDateRange({
          startDate: at('2024-02-01T00:00:00Z'),
          endDate: at('2024-02-02T00:00:00Z'),
          scale: TimeScale.Day,
          timezone: 'UTC',
        }),
      );

      expect(series.map((point) => point.value)).toEqual([7]);
    });

    it('keeps an hourly tile in its own bucket at hour scale', async () => {
      tileFind.mockResolvedValue([
        new UploadTilesEntity({ time: at('2024-02-01T00:00:00Z'), count: 3 }),
        new UploadTilesEntity({ time: at('2024-02-01T01:00:00Z'), count: 4 }),
      ]);

      const series = await service.count(
        hourly('2024-02-01T00:00:00Z', '2024-02-01T02:00:00Z'),
      );

      expect(series.map((point) => point.value)).toEqual([3, 4]);
    });

    it('goes back to the tiles on every call, since its cache is off', async () => {
      const range = hourly('2024-03-01T00:00:00Z', '2024-03-01T04:00:00Z');

      await service.count(range);
      await service.count(range);

      expect(tileFind).toHaveBeenCalledTimes(2);
    });
  });

  describe('countUploader', () => {
    it('counts only first versions in the window, which is what an upload is', async () => {
      await service.countUploader(
        500,
        hourly('2024-04-01T00:00:00Z', '2024-04-01T04:00:00Z'),
      );

      const where = (
        versionFind.mock.calls[0]![0] as FindManyOptions<PostVersionEntity>
      ).where as FindOptionsWhere<PostVersionEntity>;

      expect(where.version).toBe(1);
      expect(where.updaterId).toBe(500);
      expect(
        inRange(
          where.updatedAt,
          '2024-04-01T00:00:00Z',
          '2024-04-01T04:00:00Z',
        ),
      ).toBe(true);
    });
  });

  describe('uploaders', () => {
    it('ranks uploaders by first versions in the window', async () => {
      await service.uploaders(
        hourly('2024-05-01T00:00:00Z', '2024-05-01T04:00:00Z'),
      );

      const where = versionBuilder.calls['where']![0]![0] as Record<
        string,
        unknown
      >;

      expect(where['version']).toBe(1);
      expect(
        inRange(
          where['updatedAt'],
          '2024-05-01T00:00:00Z',
          '2024-05-01T04:00:00Z',
        ),
      ).toBe(true);
      expect(versionBuilder.calls['groupBy']![0]![0]).toMatch(/updater_id$/);
      expect(versionBuilder.calls['orderBy']).toEqual([['total', 'DESC']]);
    });

    it('offsets by whole pages when one is asked for', async () => {
      await service.uploaders(
        hourly('2024-06-01T00:00:00Z', '2024-06-01T04:00:00Z'),
        new PaginationParams({ page: 3, limit: 10 }),
      );

      expect(versionBuilder.calls['offset']).toEqual([[20]]);
      expect(versionBuilder.calls['limit']).toEqual([[10]]);
    });
  });
});
