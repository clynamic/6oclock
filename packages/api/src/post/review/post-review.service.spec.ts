import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';

import { PostReviewEpisodeEntity } from './post-review.entity';
import { PostReviewService } from './post-review.service';
import { PostReviewEpisodeData } from './post-review.utils';

const at = (iso: string): Date => new Date(iso);

const spell = (
  partial?: Partial<PostReviewEpisodeData>,
): PostReviewEpisodeData =>
  ({
    postId: 1,
    enteredAt: at('2024-03-01T00:00:00Z'),
    exitedAt: null,
    exit: null,
    ...partial,
  }) as PostReviewEpisodeData;

type BuilderCalls = Record<string, unknown[][]>;

describe('PostReviewService', () => {
  let service: PostReviewService;
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
      execute: jest.fn().mockResolvedValue(undefined),
    };

    createQueryBuilder = jest.fn().mockReturnValue(builder);
    clear = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        PostReviewService,
        {
          provide: getRepositoryToken(PostReviewEpisodeEntity),
          useValue: { createQueryBuilder, clear },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PostReviewService);
  });

  const conflictColumns = (): string[] => calls['orUpdate']![0]![1] as string[];
  const refreshedColumns = (): string[] =>
    calls['orUpdate']![0]![0] as string[];

  it('touches the database not at all for an empty batch', async () => {
    await service.upsertEpisodes([]);

    expect(createQueryBuilder).not.toHaveBeenCalled();
  });

  it('identifies an episode by the post and when it entered review', async () => {
    await service.upsertEpisodes([spell()]);

    expect(conflictColumns()).toEqual(['post_id', 'entered_at']);
  });

  it('lets one post carry several spells, since it can re-enter review', async () => {
    await service.upsertEpisodes([
      spell({ enteredAt: at('2024-03-01T00:00:00Z') }),
      spell({ enteredAt: at('2024-06-01T00:00:00Z') }),
    ]);

    expect(calls['values']![0]![0]).toHaveLength(2);
  });

  it('refreshes only how a spell ended', async () => {
    await service.upsertEpisodes([spell()]);

    expect(refreshedColumns()).toEqual(['exited_at', 'exit', 'updated_at']);
  });

  it('never rewrites when a spell began, since that names the episode', async () => {
    await service.upsertEpisodes([spell()]);

    expect(refreshedColumns()).not.toContain('entered_at');
  });

  it('writes an unfinished spell with no exit rather than skipping it', async () => {
    await service.upsertEpisodes([spell({ exitedAt: null, exit: null })]);

    expect(calls['values']![0]![0]).toEqual([
      expect.objectContaining({ exitedAt: null, exit: null }),
    ]);
  });

  it('empties the table when asked to wipe', async () => {
    await service.wipe();

    expect(clear).toHaveBeenCalled();
  });
});
