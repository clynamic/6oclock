import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { Job } from 'src/job/job.constants';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';

import { FlagHandling } from './flag-lifecycle.entity';
import {
  FlagEpisodeData,
  FlagLifecycleService,
} from './flag-lifecycle.service';
import { FlagLifecycleWorker } from './flag-lifecycle.worker';

const job: Job = { id: 'flagLifecycle/postEvents', name: 'test', data: {} };

const at = (iso: string): Date => new Date(iso);

const flagEvent = (
  postId: number,
  action: PostEventAction,
  iso: string,
  creatorId = 900,
): Record<string, unknown> => ({
  post_id: postId,
  created_at: at(iso),
  action,
  creator_id: creatorId,
});

describe('FlagLifecycleWorker', () => {
  let worker: FlagLifecycleWorker;
  let query: jest.Mock;
  let upsertEpisodes: jest.Mock;

  const runWith = async (
    events: Record<string, unknown>[],
  ): Promise<FlagEpisodeData[]> => {
    query.mockResolvedValue(events);
    await worker.runSync(job);
    return upsertEpisodes.mock.calls[0]?.[0] ?? [];
  };

  beforeEach(async () => {
    query = jest.fn().mockResolvedValue([]);
    upsertEpisodes = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        FlagLifecycleWorker,
        { provide: FlagLifecycleService, useValue: { upsertEpisodes } },
        {
          provide: getRepositoryToken(ManifestEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([
              {
                startDate: at('2024-01-01T00:00:00Z'),
                endDate: at('2024-01-02T00:00:00Z'),
              },
            ]),
          },
        },
        {
          provide: getRepositoryToken(PostEventEntity),
          useValue: { query },
        },
      ],
    }).compile();

    worker = moduleRef.get(FlagLifecycleWorker);
  });

  describe('the population it reads', () => {
    it('reads flag creations, flag removals and deletions, and nothing else', async () => {
      await worker.runSync(job);

      const parameters = query.mock.calls[0]![1] as unknown[];

      expect(parameters).toEqual([
        PostEventAction.flag_created,
        PostEventAction.flag_removed,
        PostEventAction.deleted,
        expect.any(Date),
        expect.any(Date),
      ]);
    });

    it('pulls the whole flag history of every post the window touched', async () => {
      await worker.runSync(job);

      const sql = (query.mock.calls[0]![0] as string).replace(/\s+/g, ' ');

      expect(sql).toMatch(/post_id IN \( SELECT DISTINCT post_id/);
      expect(sql).toMatch(/ORDER BY pe\.post_id, pe\.created_at, pe\.id/);
    });

    it('writes nothing when the window touched no flag events', async () => {
      await worker.runSync(job);

      expect(upsertEpisodes).not.toHaveBeenCalled();
    });
  });

  describe('the episodes it reconstructs', () => {
    it('opens an episode on a flag and closes it on a removal', async () => {
      const episodes = await runWith([
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z', 100),
        flagEvent(1, PostEventAction.flag_removed, '2024-01-01T05:00:00Z', 200),
      ]);

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
      const episodes = await runWith([
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z'),
        flagEvent(1, PostEventAction.deleted, '2024-01-01T05:00:00Z', 300),
      ]);

      expect(episodes[0]).toMatchObject({
        handling: FlagHandling.deleted,
        handlerId: 300,
      });
    });

    it('treats a repeat flag on an already flagged post as the same episode', async () => {
      const episodes = await runWith([
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z'),
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T02:00:00Z'),
        flagEvent(1, PostEventAction.flag_removed, '2024-01-01T05:00:00Z'),
      ]);

      expect(episodes).toHaveLength(1);
      expect(episodes[0]!.flaggedAt).toEqual(at('2024-01-01T01:00:00Z'));
    });

    it('ignores a deletion of a post that was never flagged', async () => {
      const episodes = await runWith([
        flagEvent(1, PostEventAction.deleted, '2024-01-01T05:00:00Z'),
      ]);

      expect(episodes).toEqual([]);
    });

    it('opens a second episode when a handled post is flagged again', async () => {
      const episodes = await runWith([
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z'),
        flagEvent(1, PostEventAction.flag_removed, '2024-01-01T02:00:00Z'),
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T03:00:00Z'),
        flagEvent(1, PostEventAction.deleted, '2024-01-01T04:00:00Z'),
      ]);

      expect(episodes).toHaveLength(2);
      expect(episodes.map((episode) => episode.handling)).toEqual([
        FlagHandling.removed,
        FlagHandling.deleted,
      ]);
    });

    it('leaves an episode open when nothing ever closed it', async () => {
      const episodes = await runWith([
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z'),
      ]);

      expect(episodes[0]).toMatchObject({
        handledAt: null,
        handlerId: null,
        handling: null,
      });
    });

    it('closes out an open episode when the next post begins', async () => {
      const episodes = await runWith([
        flagEvent(1, PostEventAction.flag_created, '2024-01-01T01:00:00Z'),
        flagEvent(2, PostEventAction.flag_created, '2024-01-01T02:00:00Z'),
        flagEvent(2, PostEventAction.flag_removed, '2024-01-01T03:00:00Z'),
      ]);

      expect(episodes.map((episode) => episode.postId)).toEqual([1, 2]);
      expect(episodes[0]!.handledAt).toBeNull();
      expect(episodes[1]!.handledAt).toEqual(at('2024-01-01T03:00:00Z'));
    });
  });
});
