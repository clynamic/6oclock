import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { PartialDateRange } from 'src/common';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';

import { UploadTilesEntity } from './upload-tiles.entity';
import { UploadTilesService } from './upload-tiles.service';

const at = (iso: string): Date => new Date(iso);

type BuilderCalls = Record<string, unknown[][]>;

describe('UploadTilesService', () => {
  let service: UploadTilesService;
  let versionCalls: BuilderCalls;
  let tileCalls: BuilderCalls;
  let versionBuilders: number;
  let rows: { time: Date; count: string }[];
  let clear: jest.Mock;
  let remove: jest.Mock;

  const recorder = (
    calls: BuilderCalls,
    terminal: Record<string, jest.Mock>,
  ): Record<string, unknown> => {
    const record =
      (name: string) =>
      (...args: unknown[]) => {
        (calls[name] ??= []).push(args);
        return builder;
      };

    const builder: Record<string, unknown> = {
      select: record('select'),
      addSelect: record('addSelect'),
      where: record('where'),
      andWhere: record('andWhere'),
      groupBy: record('groupBy'),
      insert: record('insert'),
      into: record('into'),
      values: record('values'),
      orUpdate: record('orUpdate'),
      ...terminal,
    };

    return builder;
  };

  beforeEach(async () => {
    versionCalls = {};
    tileCalls = {};
    versionBuilders = 0;
    rows = [];
    clear = jest.fn().mockResolvedValue(undefined);
    remove = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        UploadTilesService,
        {
          provide: getRepositoryToken(UploadTilesEntity),
          useValue: {
            createQueryBuilder: () =>
              recorder(tileCalls, {
                execute: jest.fn().mockResolvedValue(undefined),
              }),
            clear,
            delete: remove,
          },
        },
        {
          provide: getRepositoryToken(PostVersionEntity),
          useValue: {
            createQueryBuilder: () => {
              versionBuilders++;
              return recorder(versionCalls, {
                getRawMany: jest.fn().mockResolvedValue(rows),
              });
            },
          },
        },
        {
          provide: getRepositoryToken(ManifestEntity),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(UploadTilesService);
  });

  const clauses = (calls: BuilderCalls, name: string): string[] =>
    (calls[name] ?? []).map((args) => String(args[0]));

  describe('generating counts for hours', () => {
    it('asks the database nothing when handed no hours', async () => {
      await expect(service.generate([])).resolves.toEqual(new Map());
      expect(versionBuilders).toBe(0);
    });

    it('counts only the first version, since a later edit is not an upload', async () => {
      await service.generate([at('2024-03-01T00:00:00Z')]);

      expect(versionCalls['where']![0]).toEqual([
        'post_version.version = :version',
        { version: 1 },
      ]);
    });

    it('closes the range at the end so an hour is never counted twice', async () => {
      await service.generate([at('2024-03-01T00:00:00Z')]);

      const conditions = clauses(versionCalls, 'andWhere');

      expect(conditions).toContain('post_version.updated_at >= :start');
      expect(conditions).toContain('post_version.updated_at < :end');
    });

    it('gathers contiguous hours into one query rather than one each', async () => {
      await service.generate([
        at('2024-03-01T00:00:00Z'),
        at('2024-03-01T01:00:00Z'),
        at('2024-03-01T02:00:00Z'),
      ]);

      expect(versionBuilders).toBe(1);
    });

    it('splits a gap in the hours into separate queries', async () => {
      await service.generate([
        at('2024-03-01T00:00:00Z'),
        at('2024-03-01T05:00:00Z'),
      ]);

      expect(versionBuilders).toBe(2);
    });

    it('keys each count by the hour it belongs to', async () => {
      rows = [{ time: at('2024-03-01T00:00:00Z'), count: '7' }];

      const result = await service.generate([at('2024-03-01T00:00:00Z')]);

      expect(result.get('2024-03-01T00:00:00.000Z')).toEqual({ count: 7 });
    });

    it('leaves out an hour nothing was uploaded in, rather than claiming zero', async () => {
      rows = [];

      const result = await service.generate([at('2024-03-01T00:00:00Z')]);

      expect(result.has('2024-03-01T00:00:00.000Z')).toBe(false);
    });
  });

  describe('writing tiles', () => {
    it('touches the database not at all for an empty batch', async () => {
      await service.upsert([]);

      expect(tileCalls['insert']).toBeUndefined();
    });

    it('treats one hour as one tile, so a rerun overwrites its count', async () => {
      await service.upsert([
        new UploadTilesEntity({ time: at('2024-03-01T00:00:00Z'), count: 1 }),
      ]);

      expect(tileCalls['orUpdate']![0]).toEqual([
        ['count', 'updated_at'],
        ['time'],
      ]);
    });
  });

  describe('wiping tiles', () => {
    it('clears everything when no range narrows it', async () => {
      await service.wipe();

      expect(clear).toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    });

    it('deletes only the range it was given', async () => {
      await service.wipe(
        new PartialDateRange({
          startDate: at('2024-03-01T00:00:00Z'),
          endDate: at('2024-03-02T00:00:00Z'),
        }),
      );

      expect(remove).toHaveBeenCalled();
      expect(clear).not.toHaveBeenCalled();
    });

    it('clears everything when the range names no bounds', async () => {
      await service.wipe(new PartialDateRange({}));

      expect(clear).toHaveBeenCalled();
    });
  });
});
