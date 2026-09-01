import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { Job } from 'src/job/job.constants';
import { LabelEntity } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ManifestStampService } from 'src/manifest/stamps/manifest-stamp.service';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { createTestDatabase, runMigrations } from 'src/testing/postgres';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { FlagHandling } from './flag-lifecycle.entity';
import {
  FlagEpisodeData,
  FlagLifecycleService,
} from './flag-lifecycle.service';
import { FlagLifecycleWorker } from './flag-lifecycle.worker';

const job: Job = { id: 'flagLifecycle/postEvents', name: 'test', data: {} };

const at = (iso: string): Date => new Date(iso);

const WINDOW_START = '2024-01-01T00:00:00Z';
const WINDOW_END = '2024-01-02T00:00:00Z';

describe('FlagLifecycleWorker against Postgres', () => {
  let moduleRef: TestingModule;
  let worker: FlagLifecycleWorker;
  let events: Repository<PostEventEntity>;
  let source: DataSource;
  let upsertEpisodes: jest.Mock;
  let nextId = 1;

  const event = (
    postId: number,
    action: PostEventAction,
    iso: string,
    creatorId = 900,
  ): Promise<unknown> =>
    events.insert({
      id: nextId++,
      postId,
      creatorId,
      action,
      createdAt: at(iso),
    });

  const run = async (): Promise<FlagEpisodeData[]> => {
    await worker.runSync(job);
    return upsertEpisodes.mock.calls[0]?.[0] ?? [];
  };

  beforeAll(async () => {
    const database = await createTestDatabase('six_oclock_test_flag_lifecycle');
    await runMigrations(database);

    upsertEpisodes = jest.fn().mockResolvedValue(undefined);

    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...database,
          entities: [PostEventEntity, ManifestEntity, LabelEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([PostEventEntity, ManifestEntity]),
      ],
      providers: [
        FlagLifecycleWorker,
        { provide: FlagLifecycleService, useValue: { upsertEpisodes } },
        {
          provide: ManifestStampService,
          useValue: {
            pending: jest
              .fn()
              .mockImplementation((_target, manifests) => manifests),
            stamp: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideProvider(getRepositoryToken(ManifestEntity))
      .useValue({
        find: jest.fn().mockResolvedValue([
          {
            id: 1,
            startDate: at(WINDOW_START),
            endDate: at(WINDOW_END),
          },
        ]),
      })
      .compile();

    worker = moduleRef.get(FlagLifecycleWorker);
    source = moduleRef.get(DataSource);
    events = source.getRepository(PostEventEntity);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    await source.query('TRUNCATE post_events CASCADE');
    upsertEpisodes.mockClear();
    nextId = 1;
  });

  describe('the population it reads', () => {
    it('ignores an event that is not a flag, a removal or a deletion', async () => {
      await event(1, PostEventAction.approved, '2024-01-01T01:00:00Z');

      await expect(run()).resolves.toEqual([]);
    });

    it('pulls the whole flag history of a post the window touched', async () => {
      await event(1, PostEventAction.flag_created, '2023-12-20T01:00:00Z');
      await event(1, PostEventAction.flag_removed, '2024-01-01T05:00:00Z', 200);

      const episodes = await run();

      expect(episodes).toEqual([
        {
          postId: 1,
          flaggedAt: at('2023-12-20T01:00:00Z'),
          handledAt: at('2024-01-01T05:00:00Z'),
          handlerId: 200,
          handling: FlagHandling.removed,
        },
      ]);
    });

    it('leaves a post the window never touched alone', async () => {
      await event(1, PostEventAction.flag_created, '2023-12-20T01:00:00Z');

      await expect(run()).resolves.toEqual([]);
    });

    it('writes nothing when the window touched no flag events', async () => {
      await run();

      expect(upsertEpisodes).not.toHaveBeenCalled();
    });
  });

  describe('the episodes it reconstructs', () => {
    it('opens an episode on a flag and closes it on a removal', async () => {
      await event(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z', 100);
      await event(1, PostEventAction.flag_removed, '2024-01-01T05:00:00Z', 200);

      const episodes = await run();

      expect(episodes).toEqual([
        {
          postId: 1,
          flaggedAt: at('2024-01-01T01:00:00Z'),
          handledAt: at('2024-01-01T05:00:00Z'),
          handlerId: 200,
          handling: FlagHandling.removed,
        },
      ]);
    });

    it('closes an episode on a deletion and records it as a deletion', async () => {
      await event(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z');
      await event(1, PostEventAction.deleted, '2024-01-01T05:00:00Z', 300);

      const episodes = await run();

      expect(episodes[0]).toMatchObject({
        handling: FlagHandling.deleted,
        handlerId: 300,
      });
    });

    it('treats a repeat flag on an already flagged post as the same episode', async () => {
      await event(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z');
      await event(1, PostEventAction.flag_created, '2024-01-01T02:00:00Z');
      await event(1, PostEventAction.flag_removed, '2024-01-01T05:00:00Z');

      const episodes = await run();

      expect(episodes).toHaveLength(1);
      expect(episodes[0]!.flaggedAt).toEqual(at('2024-01-01T01:00:00Z'));
    });

    it('ignores a deletion of a post that was never flagged', async () => {
      await event(1, PostEventAction.deleted, '2024-01-01T05:00:00Z');

      await expect(run()).resolves.toEqual([]);
    });

    it('opens a second episode when a handled post is flagged again', async () => {
      await event(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z');
      await event(1, PostEventAction.flag_removed, '2024-01-01T02:00:00Z');
      await event(1, PostEventAction.flag_created, '2024-01-01T03:00:00Z');
      await event(1, PostEventAction.deleted, '2024-01-01T04:00:00Z');

      const episodes = await run();

      expect(episodes).toHaveLength(2);
      expect(episodes.map((episode) => episode.handling)).toEqual([
        FlagHandling.removed,
        FlagHandling.deleted,
      ]);
    });

    it('leaves an episode open when nothing ever closed it', async () => {
      await event(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z');

      const episodes = await run();

      expect(episodes[0]).toMatchObject({
        handledAt: null,
        handlerId: null,
        handling: null,
      });
    });

    it('closes out an open episode when the next post begins', async () => {
      await event(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z');
      await event(2, PostEventAction.flag_created, '2024-01-01T02:00:00Z');
      await event(2, PostEventAction.flag_removed, '2024-01-01T03:00:00Z');

      const episodes = await run();

      expect(episodes.map((episode) => episode.postId)).toEqual([1, 2]);
      expect(episodes[0]!.handledAt).toBeNull();
      expect(episodes[1]!.handledAt).toEqual(at('2024-01-01T03:00:00Z'));
    });
  });
});
