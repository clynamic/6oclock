import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from 'src/job/job.constants';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ManifestStampService } from 'src/manifest/stamps/manifest-stamp.service';
import { PermitEntity } from 'src/permit/permit.entity';
import { PermitTilesService } from 'src/permit/tiles/permit-tiles.service';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';

import { PostReviewService } from './post-review.service';
import { PostReviewWorker } from './post-review.worker';

const job: Job = { id: 'postReview/episodes', name: 'test', data: {} };

const at = (iso: string): Date => new Date(iso);

const claim = (id: number, type: ItemType, updatedAt: string): ManifestEntity =>
  new ManifestEntity({
    id,
    type,
    startDate: at('2024-01-01T00:00:00Z'),
    endDate: at('2024-01-02T00:00:00Z'),
    updatedAt: at(updatedAt),
  });

describe('PostReviewWorker', () => {
  let worker: PostReviewWorker;
  let stampedAt: jest.Mock;
  let stamp: jest.Mock;
  let updatedAt: jest.Mock;

  const runWith = async (
    manifestUpdatedAt: string,
    stamps: [number, Date][],
    tiles: [number, Date][],
  ): Promise<number[]> => {
    stampedAt.mockResolvedValue(new Map(stamps));
    updatedAt.mockResolvedValue(new Map(tiles));

    const manifests = [
      claim(1, ItemType.postEvents, manifestUpdatedAt),
      claim(2, ItemType.postVersions, manifestUpdatedAt),
    ];

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostReviewWorker,
        {
          provide: PostReviewService,
          useValue: { upsertEpisodes: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ManifestStampService,
          useValue: { stampedAt, stamp },
        },
        {
          provide: PermitTilesService,
          useValue: { updatedAt },
        },
        {
          provide: getRepositoryToken(ManifestEntity),
          useValue: { find: jest.fn().mockResolvedValue(manifests) },
        },
        {
          provide: getRepositoryToken(PostEventEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            query: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(PostVersionEntity),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getRepositoryToken(PermitEntity),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    worker = moduleRef.get(PostReviewWorker);

    await worker.runSync(job);

    return (stamp.mock.calls[0]?.[1] as number[]) ?? [];
  };

  beforeEach(() => {
    stampedAt = jest.fn().mockResolvedValue(new Map());
    stamp = jest.fn().mockResolvedValue(undefined);
    updatedAt = jest.fn().mockResolvedValue(new Map());
  });

  describe('choosing which ranges to rebuild', () => {
    it('rebuilds a range whose permits landed after it was last built', async () => {
      const rebuilt = await runWith(
        '2024-02-01T00:00:00Z',
        [
          [1, at('2024-03-01T00:00:00Z')],
          [2, at('2024-03-01T00:00:00Z')],
        ],
        [
          [1, at('2024-03-02T00:00:00Z')],
          [2, at('2024-03-02T00:00:00Z')],
        ],
      );

      expect(rebuilt).toEqual([1, 2]);
    });

    it('rebuilds a range whose manifests moved on after it was last built', async () => {
      const rebuilt = await runWith(
        '2024-03-02T00:00:00Z',
        [
          [1, at('2024-03-01T00:00:00Z')],
          [2, at('2024-03-01T00:00:00Z')],
        ],
        [],
      );

      expect(rebuilt).toEqual([1, 2]);
    });

    it('leaves a range alone when neither its manifests nor its permits changed', async () => {
      const rebuilt = await runWith(
        '2024-02-01T00:00:00Z',
        [
          [1, at('2024-03-01T00:00:00Z')],
          [2, at('2024-03-01T00:00:00Z')],
        ],
        [
          [1, at('2024-02-02T00:00:00Z')],
          [2, at('2024-02-02T00:00:00Z')],
        ],
      );

      expect(stamp).not.toHaveBeenCalled();
      expect(rebuilt).toEqual([]);
    });

    it('rebuilds a range this target has never built', async () => {
      const rebuilt = await runWith('2024-02-01T00:00:00Z', [], []);

      expect(rebuilt).toEqual([1, 2]);
    });
  });
});
