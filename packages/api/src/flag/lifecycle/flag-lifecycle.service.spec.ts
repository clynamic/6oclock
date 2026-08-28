import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';

import { FlagHandling, FlagLifecycleEntity } from './flag-lifecycle.entity';
import {
  FlagEpisodeData,
  FlagLifecycleService,
} from './flag-lifecycle.service';

const at = (iso: string): Date => new Date(iso);

const episode = (partial?: Partial<FlagEpisodeData>): FlagEpisodeData => ({
  postId: 1,
  flaggedAt: at('2024-03-01T00:00:00Z'),
  handledAt: null,
  handlerId: null,
  handling: null,
  ...partial,
});

type BuilderCalls = Record<string, unknown[][]>;

describe('FlagLifecycleService', () => {
  let service: FlagLifecycleService;
  let calls: BuilderCalls;
  let createQueryBuilder: jest.Mock;
  let clear: jest.Mock;

  beforeEach(async () => {
    calls = {};
    const record =
      (name: string) =>
      (...args: unknown[]) => {
        (calls[name] ??= []).push(args);
        return builder;
      };

    const builder = {
      insert: record('insert'),
      into: record('into'),
      values: record('values'),
      orUpdate: record('orUpdate'),
      execute: record('execute'),
    };

    createQueryBuilder = jest.fn().mockReturnValue(builder);
    clear = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        FlagLifecycleService,
        {
          provide: getRepositoryToken(FlagLifecycleEntity),
          useValue: { createQueryBuilder, clear },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(FlagLifecycleService);
  });

  const written = (): FlagEpisodeData[] =>
    calls['values']![0]![0] as FlagEpisodeData[];
  const conflictColumns = (): string[] => calls['orUpdate']![0]![1] as string[];
  const refreshedColumns = (): string[] =>
    calls['orUpdate']![0]![0] as string[];

  it('runs the write rather than only building it', async () => {
    await service.upsertEpisodes([episode()]);

    expect(calls['execute']).toHaveLength(1);
  });

  it('touches the database not at all for an empty batch', async () => {
    await service.upsertEpisodes([]);

    expect(createQueryBuilder).not.toHaveBeenCalled();
  });

  it('identifies an episode by the post and when it was flagged', async () => {
    await service.upsertEpisodes([episode()]);

    expect(conflictColumns()).toEqual(['post_id', 'flagged_at']);
  });

  it('lets one post carry several episodes, since it can be flagged again', async () => {
    await service.upsertEpisodes([
      episode({ flaggedAt: at('2024-03-01T00:00:00Z') }),
      episode({ flaggedAt: at('2024-06-01T00:00:00Z') }),
    ]);

    expect(written()).toHaveLength(2);
    expect(conflictColumns()).not.toContain('id');
  });

  it('refreshes only what handling an episode can change', async () => {
    await service.upsertEpisodes([episode()]);

    expect(refreshedColumns()).toEqual([
      'handled_at',
      'handler_id',
      'handling',
      'updated_at',
    ]);
  });

  it('carries the handling verdict through to the write', async () => {
    await service.upsertEpisodes([
      episode({
        handledAt: at('2024-03-02T00:00:00Z'),
        handlerId: 700,
        handling: FlagHandling.deleted,
      }),
    ]);

    expect(written()[0]).toEqual({
      postId: 1,
      flaggedAt: at('2024-03-01T00:00:00Z'),
      handledAt: at('2024-03-02T00:00:00Z'),
      handlerId: 700,
      handling: FlagHandling.deleted,
    });
  });

  it('empties the table when asked to wipe', async () => {
    await service.wipe();

    expect(clear).toHaveBeenCalled();
  });
});
