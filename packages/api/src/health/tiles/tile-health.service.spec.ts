import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { CacheManager } from 'src/app/browser.module';
import {
  DateRange,
  PaginationParams,
  PartialDateRange,
  TileType,
  TilingRange,
  TimeScale,
} from 'src/common';
import { PermitTilesService } from 'src/permit/tiles/permit-tiles.service';
import { UploadTilesService } from 'src/upload/tiles/upload-tiles.service';

import { TileHealthService } from './tile-health.service';

const at = (iso: string): Date => new Date(iso);

const spanning = (startIso: string, endIso: string): TilingRange => ({
  dateRange: new DateRange({
    startDate: at(startIso),
    endDate: at(endIso),
    scale: TimeScale.Hour,
  }),
  updatedAt: at(startIso),
});

describe('TileHealthService', () => {
  let service: TileHealthService;
  let uploadRanges: jest.Mock;
  let uploadMissing: jest.Mock;
  let uploadWipe: jest.Mock;
  let permitRanges: jest.Mock;

  beforeEach(async () => {
    uploadRanges = jest.fn().mockResolvedValue([]);
    uploadMissing = jest.fn().mockResolvedValue([]);
    uploadWipe = jest.fn().mockResolvedValue(undefined);
    permitRanges = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        TileHealthService,
        {
          provide: UploadTilesService,
          useValue: {
            interval: 1,
            getRanges: uploadRanges,
            findMissing: uploadMissing,
            wipe: uploadWipe,
          },
        },
        {
          provide: PermitTilesService,
          useValue: {
            interval: 1,
            getRanges: permitRanges,
            findMissing: jest.fn().mockResolvedValue([]),
            wipe: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(TileHealthService);
  });

  describe('counting what should be there', () => {
    it('expects one tile per hour of the range', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
      ]);

      const [health] = await service.tiles();

      expect(health!.expected).toBe(6);
    });

    it('rounds a part hour up, since a partial hour still needs a tile', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T06:30:00Z'),
      ]);

      const [health] = await service.tiles();

      expect(health!.expected).toBe(7);
    });

    it('counts as present everything it did not find missing', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
      ]);
      uploadMissing.mockResolvedValue([
        at('2024-03-01T02:00:00Z'),
        at('2024-03-01T03:00:00Z'),
      ]);

      const [health] = await service.tiles();

      expect(health!.actual).toBe(4);
    });

    it('reports nothing present when every hour is missing', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T02:00:00Z'),
      ]);
      uploadMissing.mockResolvedValue([
        at('2024-03-01T00:00:00Z'),
        at('2024-03-01T01:00:00Z'),
      ]);

      const [health] = await service.tiles();

      expect(health!.actual).toBe(0);
    });

    it('expects fewer tiles from a service that covers more hours each', async () => {
      const coarse = await Test.createTestingModule({
        imports: [CacheModule.register()],
        providers: [
          CacheManager,
          TileHealthService,
          {
            provide: UploadTilesService,
            useValue: {
              interval: 6,
              getRanges: jest
                .fn()
                .mockResolvedValue([
                  spanning('2024-03-01T00:00:00Z', '2024-03-02T00:00:00Z'),
                ]),
              findMissing: jest.fn().mockResolvedValue([]),
              wipe: jest.fn(),
            },
          },
          {
            provide: PermitTilesService,
            useValue: {
              interval: 6,
              getRanges: jest.fn().mockResolvedValue([]),
              findMissing: jest.fn().mockResolvedValue([]),
              wipe: jest.fn(),
            },
          },
        ],
      }).compile();

      coarse.get(CacheManager);
      const [health] = await coarse.get(TileHealthService).tiles();

      expect(health!.expected).toBe(4);
    });

    it('slices the span so a reader can see where the holes fall', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
      ]);
      uploadMissing.mockResolvedValue([at('2024-03-01T02:00:00Z')]);

      const [health] = await service.tiles();

      expect(health!.slices.length).toBeGreaterThan(0);
      expect(
        health!.slices.reduce((sum, slice) => sum + slice.unavailable, 0),
      ).toBe(1);
      expect(
        health!.slices.reduce((sum, slice) => sum + slice.available, 0),
      ).toBe(5);
    });

    it('carries the span it measured through to the report', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
      ]);

      const [health] = await service.tiles();

      expect(health!.startDate).toEqual(at('2024-03-01T00:00:00Z'));
      expect(health!.endDate).toEqual(at('2024-03-01T06:00:00Z'));
    });

    it('reports one entry per range a type covers', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T06:00:00Z'),
        spanning('2024-04-01T00:00:00Z', '2024-04-01T06:00:00Z'),
      ]);

      await expect(service.tiles()).resolves.toHaveLength(2);
    });

    it('says nothing about a type that covers no range at all', async () => {
      uploadRanges.mockResolvedValue([]);

      await expect(service.tiles()).resolves.toEqual([]);
    });
  });

  describe('paging over tile types', () => {
    it('starts from the first type when nobody asks otherwise', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T01:00:00Z'),
      ]);

      const health = await service.tiles();

      expect(health[0]!.type).toBe(TileType.uploadHourly);
    });

    it('walks past the types an earlier page already covered', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T01:00:00Z'),
      ]);
      permitRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T01:00:00Z'),
      ]);

      const health = await service.tiles(
        new PaginationParams({ limit: 1, page: 2 }),
      );

      expect(health).toHaveLength(1);
      expect(health[0]!.type).toBe(TileType.permitHourly);
    });
  });

  describe('wiping tiles of one type', () => {
    it('hands the wipe to the service that owns the type', async () => {
      const range = new PartialDateRange({
        startDate: at('2024-03-01T00:00:00Z'),
      });

      await service.deleteTilesByType(TileType.uploadHourly, range);

      expect(uploadWipe).toHaveBeenCalledWith(range);
    });

    it('wipes everything of that type when no range narrows it', async () => {
      await service.deleteTilesByType(TileType.uploadHourly);

      expect(uploadWipe).toHaveBeenCalledWith(undefined);
    });
  });

  describe('characterised, not specified: a type nothing owns', () => {
    it('leaves post pending tiles out of the report entirely', async () => {
      uploadRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T01:00:00Z'),
      ]);
      permitRanges.mockResolvedValue([
        spanning('2024-03-01T00:00:00Z', '2024-03-01T01:00:00Z'),
      ]);

      const health = await service.tiles();

      expect(health.map((entry) => entry.type)).not.toContain(
        TileType.postPendingHourly,
      );
    });

    it('refuses to wipe post pending tiles, though the type still exists', async () => {
      await expect(
        service.deleteTilesByType(TileType.postPendingHourly),
      ).rejects.toThrow('No service found for tile type');
    });
  });
});
