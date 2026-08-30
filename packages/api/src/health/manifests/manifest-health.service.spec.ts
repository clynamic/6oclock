import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { BulkUpdateRequestEntity } from 'src/bulk-update-request/bulk-update-request.entity';
import { FeedbackEntity } from 'src/feedback/feedback.entity';
import { FlagEntity } from 'src/flag/flag.entity';
import { ItemType, POROUS_ITEM_TYPES } from 'src/label/label.entity';
import { ContiguityGapEntity } from 'src/manifest/gaps/contiguity-gap.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TagAliasEntity } from 'src/tag-alias/tag-alias.entity';
import { TagImplicationEntity } from 'src/tag-implication/tag-implication.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';

import { ManifestHealthService } from './manifest-health.service';

const at = (iso: string): Date => new Date(iso);

const ITEM_ENTITIES = [
  PostEventEntity,
  TicketEntity,
  FlagEntity,
  FeedbackEntity,
  PostVersionEntity,
  PostReplacementEntity,
  ModActionEntity,
  BulkUpdateRequestEntity,
  TagAliasEntity,
  TagImplicationEntity,
];

let nextId = 1;

const claiming = (
  type: ItemType,
  startDate: string,
  endDate: string,
): ManifestEntity =>
  new ManifestEntity({
    id: nextId++,
    type,
    lowerId: 1,
    upperId: 3,
    startDate: at(startDate),
    endDate: at(endDate),
  });

describe('ManifestHealthService', () => {
  let service: ManifestHealthService;
  let manifestFind: jest.Mock;
  let gapQuery: jest.Mock;

  beforeEach(async () => {
    nextId = 1;
    manifestFind = jest.fn().mockResolvedValue([]);
    gapQuery = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        ManifestHealthService,
        {
          provide: getRepositoryToken(ManifestEntity),
          useValue: { find: manifestFind },
        },
        {
          provide: getRepositoryToken(ContiguityGapEntity),
          useValue: {
            query: gapQuery,
            metadata: { tableName: 'contiguity_gaps' },
          },
        },
        ...ITEM_ENTITIES.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        })),
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(ManifestHealthService);
  });

  describe('gathering a type', () => {
    it('reads the claimed ranges alone, never the items themselves', async () => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
      ]);

      await service.manifests();

      expect(manifestFind).toHaveBeenCalledWith();
    });

    it('gathers every manifest of a type into the one entry for it', async () => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
        claiming(
          ItemType.tickets,
          '2024-03-04T00:00:00Z',
          '2024-03-05T00:00:00Z',
        ),
      ]);

      const health = await service.manifests();

      expect(health).toHaveLength(1);
      expect(health[0]!.parts).toBe(2);
    });

    it('keeps the types apart', async () => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
        claiming(
          ItemType.flags,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
      ]);

      const health = await service.manifests();

      expect(health.map((item) => item.type).sort()).toEqual(
        [ItemType.flags, ItemType.tickets].sort(),
      );
    });

    it('says nothing about a type that claims nothing', async () => {
      await expect(service.manifests()).resolves.toEqual([]);
    });

    it('marks a type whose upstream leaves gaps as porous', async () => {
      const porous = POROUS_ITEM_TYPES[0]!;

      manifestFind.mockResolvedValue([
        claiming(porous, '2024-03-01T00:00:00Z', '2024-03-02T00:00:00Z'),
      ]);

      const health = await service.manifests();

      expect(health[0]!.porous).toBe(true);
    });
  });

  describe('counting the gaps', () => {
    beforeEach(() => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
      ]);
    });

    it('counts the ids the stretches span', async () => {
      gapQuery.mockResolvedValue([{ type: ItemType.tickets, gaps: '15' }]);

      const health = await service.manifests();

      expect(health[0]!.gaps).toBe(15);
    });

    it('leaves a type the scan found nothing for at zero', async () => {
      const health = await service.manifests();

      expect(health[0]!.gaps).toBe(0);
    });

    it('keeps a stretch counted against the type that holds it', async () => {
      gapQuery.mockResolvedValue([{ type: ItemType.flags, gaps: '9' }]);

      const health = await service.manifests();

      expect(health[0]!.gaps).toBe(0);
    });
  });

  describe('measuring what a type holds', () => {
    it('reports the outer edges of what the type claims', async () => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
        claiming(
          ItemType.tickets,
          '2024-03-04T00:00:00Z',
          '2024-03-05T00:00:00Z',
        ),
      ]);

      const health = await service.manifests();

      expect(health[0]!.startDate).toEqual(at('2024-03-01T00:00:00Z'));
      expect(health[0]!.endDate).toEqual(at('2024-03-05T00:00:00Z'));
    });

    it('reaches across every type, so the marks line up between them', async () => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
        claiming(
          ItemType.flags,
          '2024-01-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
      ]);

      const health = await service.manifests();

      expect(new Set(health.map((item) => item.reach)).size).toBe(1);
    });

    it('puts the emptiest type first', async () => {
      manifestFind.mockResolvedValue([
        claiming(
          ItemType.tickets,
          '2024-01-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
        claiming(
          ItemType.flags,
          '2024-03-01T00:00:00Z',
          '2024-03-02T00:00:00Z',
        ),
      ]);

      const health = await service.manifests();

      expect(health[0]!.type).toBe(ItemType.flags);
    });
  });
});
