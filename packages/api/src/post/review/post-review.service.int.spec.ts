import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { createTestDatabase, runMigrations } from 'src/testing/postgres';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { PostReviewEpisodeEntity, PostReviewExit } from './post-review.entity';
import { PostReviewService } from './post-review.service';
import { PostReviewEpisodeData } from './post-review.utils';

const at = (iso: string): Date => new Date(iso);

const episode = (
  postId: number,
  enteredAt: string,
  exit?: { exitedAt: string; exit: PostReviewExit },
): PostReviewEpisodeData => ({
  postId,
  enteredAt: at(enteredAt),
  exitedAt: exit ? at(exit.exitedAt) : null,
  exit: exit ? exit.exit : null,
});

describe('PostReviewService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: PostReviewService;
  let episodes: Repository<PostReviewEpisodeEntity>;
  let source: DataSource;

  const stored = async (): Promise<[number, string][]> =>
    episodes
      .find({ order: { postId: 'ASC', enteredAt: 'ASC' } })
      .then((rows) =>
        rows.map((row) => [row.postId, row.enteredAt.toISOString()]),
      );

  beforeAll(async () => {
    const database = await createTestDatabase('six_oclock_test_post_review');
    await runMigrations(database);

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          ...database,
          entities: [PostReviewEpisodeEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([PostReviewEpisodeEntity]),
      ],
      providers: [CacheManager, PostReviewService],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PostReviewService);
    source = moduleRef.get(DataSource);
    episodes = source.getRepository(PostReviewEpisodeEntity);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    await source.query('TRUNCATE post_review_episodes CASCADE');
  });

  describe('a post reconstruction no longer claims', () => {
    it('loses its episode, since a permit is the exit the table cannot spell', async () => {
      await service.upsertEpisodes([episode(1, '2024-03-01T00:00:00Z')]);

      await service.syncEpisodes([1], []);

      await expect(stored()).resolves.toEqual([]);
    });

    it('loses only the spell that went unclaimed', async () => {
      await service.upsertEpisodes([
        episode(1, '2024-03-01T00:00:00Z'),
        episode(1, '2024-06-01T00:00:00Z'),
      ]);

      await service.syncEpisodes([1], [episode(1, '2024-06-01T00:00:00Z')]);

      await expect(stored()).resolves.toEqual([
        [1, '2024-06-01T00:00:00.000Z'],
      ]);
    });

    it('leaves posts the rebuild never looked at alone', async () => {
      await service.upsertEpisodes([
        episode(1, '2024-03-01T00:00:00Z'),
        episode(2, '2024-03-01T00:00:00Z'),
      ]);

      await service.syncEpisodes([1], []);

      await expect(stored()).resolves.toEqual([
        [2, '2024-03-01T00:00:00.000Z'],
      ]);
    });
  });

  describe('a post reconstruction still claims', () => {
    it('keeps its episode', async () => {
      await service.upsertEpisodes([episode(1, '2024-03-01T00:00:00Z')]);

      await service.syncEpisodes([1], [episode(1, '2024-03-01T00:00:00Z')]);

      await expect(stored()).resolves.toEqual([
        [1, '2024-03-01T00:00:00.000Z'],
      ]);
    });

    it('closes the spell it already had rather than starting another', async () => {
      await service.upsertEpisodes([episode(1, '2024-03-01T00:00:00Z')]);

      await service.syncEpisodes(
        [1],
        [
          episode(1, '2024-03-01T00:00:00Z', {
            exitedAt: '2024-03-05T00:00:00Z',
            exit: PostReviewExit.approved,
          }),
        ],
      );

      const rows = await episodes.find();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.exit).toBe(PostReviewExit.approved);
    });
  });

  it('deletes nothing when the rebuild found no posts to speak for', async () => {
    await service.upsertEpisodes([episode(1, '2024-03-01T00:00:00Z')]);

    await service.syncEpisodes([], []);

    await expect(stored()).resolves.toEqual([[1, '2024-03-01T00:00:00.000Z']]);
  });
});
