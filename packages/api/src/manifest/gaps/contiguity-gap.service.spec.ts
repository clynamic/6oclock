import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import { AppealEntity } from 'src/appeal/appeal.entity';
import { BulkUpdateRequestEntity } from 'src/bulk-update-request/bulk-update-request.entity';
import { FeedbackEntity } from 'src/feedback/feedback.entity';
import { FlagEntity } from 'src/flag/flag.entity';
import { ItemType } from 'src/label/label.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { PermitEntity } from 'src/permit/permit.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TagAliasEntity } from 'src/tag-alias/tag-alias.entity';
import { TagImplicationEntity } from 'src/tag-implication/tag-implication.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';

import { ManifestEntity } from '../manifest.entity';
import { ContiguityGapEntity } from './contiguity-gap.entity';
import { ContiguityGapService } from './contiguity-gap.service';

const ITEM_ENTITIES = [
  AppealEntity,
  BulkUpdateRequestEntity,
  FeedbackEntity,
  FlagEntity,
  ModActionEntity,
  PermitEntity,
  PostEventEntity,
  PostReplacementEntity,
  PostVersionEntity,
  TagAliasEntity,
  TagImplicationEntity,
  TicketEntity,
];

const at = (iso: string): Date => new Date(iso);

const claiming = (
  id: number,
  type: ItemType,
  lowerId: number,
  upperId: number,
): ManifestEntity => new ManifestEntity({ id, type, lowerId, upperId });

describe('ContiguityGapService', () => {
  let service: ContiguityGapService;
  let ticketQuery: jest.Mock;
  let postVersionQuery: jest.Mock;

  beforeEach(async () => {
    ticketQuery = jest.fn().mockResolvedValue([]);
    postVersionQuery = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        ContiguityGapService,
        {
          provide: getRepositoryToken(ContiguityGapEntity),
          useValue: { manager: { transaction: jest.fn() } },
        },
        ...ITEM_ENTITIES.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: {
            query:
              entity === TicketEntity
                ? ticketQuery
                : entity === PostVersionEntity
                  ? postVersionQuery
                  : jest.fn(),
            metadata: {
              tableName: 'items',
              columns:
                entity === PostVersionEntity
                  ? [
                      { propertyName: 'id', databaseName: 'id' },
                      { propertyName: 'updatedAt', databaseName: 'updated_at' },
                    ]
                  : [
                      { propertyName: 'id', databaseName: 'id' },
                      { propertyName: 'createdAt', databaseName: 'created_at' },
                    ],
            },
          },
        })),
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(ContiguityGapService);
  });

  describe('choosing the range to scan', () => {
    it('starts a type at its own lower bound when nothing precedes it', () => {
      const first = claiming(1, ItemType.tickets, 100, 200);

      const ranges = service.rangesOf([first], [first]);

      expect(ranges).toEqual([
        { type: ItemType.tickets, manifestId: 1, lowerId: 100, upperId: 200 },
      ]);
    });

    it('reaches back to the previous manifest, so the ids between are scanned', () => {
      const first = claiming(1, ItemType.tickets, 100, 200);
      const second = claiming(2, ItemType.tickets, 260, 300);

      const ranges = service.rangesOf([first, second], [second]);

      expect(ranges).toEqual([
        { type: ItemType.tickets, manifestId: 2, lowerId: 200, upperId: 300 },
      ]);
    });

    it('reads the reach-back from a manifest it was not asked to scan', () => {
      const first = claiming(1, ItemType.tickets, 100, 200);
      const second = claiming(2, ItemType.tickets, 260, 300);

      const ranges = service.rangesOf([first, second], [second]);

      expect(ranges).toHaveLength(1);
      expect(ranges[0]!.lowerId).toBe(200);
    });

    it('never reaches back across a type boundary', () => {
      const ticket = claiming(1, ItemType.tickets, 100, 200);
      const flag = claiming(2, ItemType.flags, 900, 950);

      const ranges = service.rangesOf([ticket, flag], [flag]);

      expect(ranges[0]!.lowerId).toBe(900);
    });

    it('leaves out a manifest that is not being scanned', () => {
      const first = claiming(1, ItemType.tickets, 100, 200);
      const second = claiming(2, ItemType.tickets, 260, 300);

      const ranges = service.rangesOf([first, second], [first]);

      expect(ranges.map((range) => range.manifestId)).toEqual([1]);
    });

    it('leaves out a type it holds no items for', () => {
      const posts = claiming(1, ItemType.posts, 100, 200);

      expect(service.rangesOf([posts], [posts])).toEqual([]);
    });

    it('orders a type by its ids, not by the order it was given them', () => {
      const first = claiming(1, ItemType.tickets, 100, 200);
      const second = claiming(2, ItemType.tickets, 260, 300);

      const ranges = service.rangesOf([second, first], [second]);

      expect(ranges[0]!.lowerId).toBe(200);
    });
  });

  describe('scanning', () => {
    it('carries the range type onto every stretch it found', async () => {
      ticketQuery.mockResolvedValue([
        {
          lower: 201,
          upper: 259,
          after: at('2024-03-01T00:00:00Z'),
          before: at('2024-03-01T02:00:00Z'),
        },
      ]);

      const gaps = await service.scan({
        type: ItemType.tickets,
        manifestId: 2,
        lowerId: 200,
        upperId: 300,
      });

      expect(gaps).toEqual([
        new ContiguityGapEntity({
          type: ItemType.tickets,
          lowerId: 201,
          upperId: 259,
          startDate: at('2024-03-01T00:00:00Z'),
          endDate: at('2024-03-01T02:00:00Z'),
        }),
      ]);
    });

    it('reads the creation date of a type that keeps one', async () => {
      await service.scan({
        type: ItemType.tickets,
        manifestId: 2,
        lowerId: 200,
        upperId: 300,
      });

      expect(ticketQuery.mock.calls[0]![0]).toContain('created_at');
    });

    it('falls back to the update date of a type that keeps no creation date', async () => {
      await service.scan({
        type: ItemType.postVersions,
        manifestId: 2,
        lowerId: 200,
        upperId: 300,
      });

      expect(postVersionQuery.mock.calls[0]![0]).toContain('updated_at');
    });

    it('scans between the range bounds', async () => {
      await service.scan({
        type: ItemType.tickets,
        manifestId: 2,
        lowerId: 200,
        upperId: 300,
      });

      expect(ticketQuery).toHaveBeenCalledWith(expect.any(String), [200, 300]);
    });
  });
});
