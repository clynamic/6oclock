import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { BulkUpdateRequestEntity } from 'src/bulk-update-request/bulk-update-request.entity';
import { PaginationParams } from 'src/common';
import { FeedbackEntity } from 'src/feedback/feedback.entity';
import { FlagEntity } from 'src/flag/flag.entity';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TagAliasEntity } from 'src/tag-alias/tag-alias.entity';
import { TagImplicationEntity } from 'src/tag-implication/tag-implication.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';
import { FindManyOptions } from 'typeorm';

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

const manifestOf = (type: ItemType, lowerId = 1, upperId = 3): ManifestEntity =>
  new ManifestEntity({
    id: 1,
    type,
    lowerId,
    upperId,
    startDate: at('2024-03-01T00:00:00Z'),
    endDate: at('2024-03-02T00:00:00Z'),
  });

describe('ManifestHealthService', () => {
  let service: ManifestHealthService;
  let manifestFind: jest.Mock;
  let ticketFind: jest.Mock;

  const build = async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        ManifestHealthService,
        {
          provide: getRepositoryToken(ManifestEntity),
          useValue: { find: manifestFind },
        },
        ...ITEM_ENTITIES.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: {
            find:
              entity === TicketEntity
                ? ticketFind
                : jest.fn().mockResolvedValue([]),
          },
        })),
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(ManifestHealthService);
  };

  beforeEach(async () => {
    manifestFind = jest.fn().mockResolvedValue([]);
    ticketFind = jest.fn().mockResolvedValue([]);
    await build();
  });

  describe('paging', () => {
    it('asks for the newest manifests first, so health reads recent', async () => {
      await service.manifests();

      const options = manifestFind.mock
        .calls[0]![0] as FindManyOptions<ManifestEntity>;

      expect(options.order).toEqual({ endDate: 'DESC', id: 'DESC' });
    });

    it('takes five at a time, since each one costs a full id scan', async () => {
      await service.manifests();

      const options = manifestFind.mock
        .calls[0]![0] as FindManyOptions<ManifestEntity>;

      expect(options.take).toBe(5);
    });

    it('lets a caller ask for a different page size', async () => {
      await service.manifests(new PaginationParams({ limit: 2 }));

      const options = manifestFind.mock
        .calls[0]![0] as FindManyOptions<ManifestEntity>;

      expect(options.take).toBe(2);
    });

    it('walks forward by whole pages', async () => {
      await service.manifests(new PaginationParams({ limit: 5, page: 3 }));

      const options = manifestFind.mock
        .calls[0]![0] as FindManyOptions<ManifestEntity>;

      expect(options.skip).toBe(10);
    });
  });

  describe('reading one manifest', () => {
    it('counts the ids it actually found, not the width of the range', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets, 1, 100)]);
      ticketFind.mockResolvedValue([{ id: 1 }, { id: 50 }]);

      const [health] = await service.manifests();

      expect(health!.count).toBe(2);
    });

    it('asks the item table only for ids inside the manifest bounds', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets, 10, 20)]);

      await service.manifests();

      const where = ticketFind.mock.calls[0]![0].where as {
        id: { type: string; value: number[] };
      };

      expect(where.id.type).toBe('between');
      expect(where.id.value).toEqual([10, 20]);
    });

    it('reads ids alone and in order, since a full row scan is what the page size guards', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets, 10, 20)]);

      await service.manifests();

      const options = ticketFind.mock.calls[0]![0] as {
        select: string[];
        order: Record<string, string>;
      };

      expect(options.select).toEqual(['id']);
      expect(options.order).toEqual({ id: 'ASC' });
    });

    it('slices the range so a reader can see where the gaps fall', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets, 1, 30)]);
      ticketFind.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const [health] = await service.manifests();

      expect(health!.slices.length).toBeGreaterThan(0);
      expect(
        health!.slices.reduce((sum, slice) => sum + slice.available, 0),
      ).toBe(2);
    });

    it('reports the manifest by its own id', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets)]);

      const [health] = await service.manifests();

      expect(health!.id).toBe(1);
    });

    it('carries the manifest bounds through as the reported span', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets, 10, 20)]);

      const [health] = await service.manifests();

      expect(health!.startId).toBe(10);
      expect(health!.endId).toBe(20);
      expect(health!.startDate).toEqual(at('2024-03-01T00:00:00Z'));
    });

    it('marks a porous type porous, since its gaps are expected', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.postVersions)]);

      const [health] = await service.manifests();

      expect(health!.porous).toBe(true);
    });

    it('leaves a contiguous type unmarked, so its gaps mean something', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.tickets)]);

      const [health] = await service.manifests();

      expect(health!.porous).toBe(false);
    });
  });

  describe('characterised, not specified: a type the service holds no table for', () => {
    it('drops an appeals manifest entirely rather than reporting it empty', async () => {
      manifestFind.mockResolvedValue([manifestOf(ItemType.appeals)]);

      await expect(service.manifests()).resolves.toEqual([]);
    });

    it('still reports the manifests it does know, alongside one it does not', async () => {
      manifestFind.mockResolvedValue([
        manifestOf(ItemType.appeals),
        manifestOf(ItemType.tickets),
      ]);

      const health = await service.manifests();

      expect(health).toHaveLength(1);
      expect(health[0]!.type).toBe(ItemType.tickets);
    });
  });
});
