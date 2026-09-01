import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';
import {
  ItemType,
  LabelEntity,
  POROUS_ITEM_TYPES,
} from 'src/label/label.entity';
import { ContiguityGapEntity } from 'src/manifest/gaps/contiguity-gap.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { createTestDatabase, runMigrations } from 'src/testing/postgres';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ManifestHealthService } from './manifest-health.service';
import { SLICE_COUNT } from './manifest-health.utils';

const at = (iso: string): Date => new Date(iso);

describe('ManifestHealthService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: ManifestHealthService;
  let manifests: Repository<ManifestEntity>;
  let gaps: Repository<ContiguityGapEntity>;
  let source: DataSource;

  const claiming = (
    type: ItemType,
    startDate: string,
    endDate: string,
  ): Promise<unknown> =>
    manifests.insert({
      type,
      lowerId: 1,
      upperId: 3,
      startDate: at(startDate),
      endDate: at(endDate),
    });

  const gap = (
    type: ItemType,
    lowerId: number,
    upperId: number,
    startDate: string,
  ): Promise<unknown> =>
    gaps.insert({
      type,
      lowerId,
      upperId,
      startDate: at(startDate),
      endDate: at(startDate),
    });

  beforeAll(async () => {
    const database = await createTestDatabase(
      'six_oclock_test_manifest_health',
    );
    await runMigrations(database);

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          ...database,
          entities: [ManifestEntity, ContiguityGapEntity, LabelEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([ManifestEntity, ContiguityGapEntity]),
      ],
      providers: [CacheManager, ManifestHealthService],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(ManifestHealthService);
    source = moduleRef.get(DataSource);
    manifests = source.getRepository(ManifestEntity);
    gaps = source.getRepository(ContiguityGapEntity);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    await source.query('TRUNCATE manifests, contiguity_gaps CASCADE');
    await moduleRef.get(CacheManager).inv(ManifestEntity);
  });

  describe('gathering a type', () => {
    it('gathers every manifest of a type into the one entry for it', async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await claiming(
        ItemType.tickets,
        '2024-03-04T00:00:00Z',
        '2024-03-05T00:00:00Z',
      );

      const health = await service.manifests();

      expect(health).toHaveLength(1);
      expect(health[0]!.parts).toBe(2);
    });

    it('keeps the types apart', async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await claiming(
        ItemType.flags,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );

      const health = await service.manifests();

      expect(health.map((item) => item.type).sort()).toEqual(
        [ItemType.flags, ItemType.tickets].sort(),
      );
    });

    it('says nothing about a type that claims nothing', async () => {
      await expect(service.manifests()).resolves.toEqual([]);
    });

    it('marks a type whose upstream leaves gaps as porous', async () => {
      await claiming(
        POROUS_ITEM_TYPES[0]!,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );

      const health = await service.manifests();

      expect(health[0]!.porous).toBe(true);
    });
  });

  describe('counting the gaps', () => {
    beforeEach(async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
    });

    it('counts the ids the stretches span', async () => {
      await gap(ItemType.tickets, 10, 19, '2024-03-01T00:00:00Z');
      await gap(ItemType.tickets, 30, 34, '2024-03-01T06:00:00Z');

      const health = await service.manifests();

      expect(health[0]!.gaps).toBe(15);
    });

    it('leaves a type the scan found nothing for at zero', async () => {
      const health = await service.manifests();

      expect(health[0]!.gaps).toBe(0);
    });

    it('keeps a stretch counted against the type that holds it', async () => {
      await gap(ItemType.flags, 1, 9, '2024-03-01T00:00:00Z');

      const health = await service.manifests();

      expect(health[0]!.gaps).toBe(0);
    });
  });

  describe('placing the gaps across the reach', () => {
    it('marks the slice the stretch falls into, leaving the rest empty', async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await gap(ItemType.tickets, 1, 4, '2024-03-01T00:00:00Z');

      const health = await service.manifests();
      const slices = health[0]!.slices;

      expect(slices).toHaveLength(SLICE_COUNT);
      expect(slices.filter((slice) => slice.gaps > 0)).toHaveLength(1);
      expect(slices[0]!.gaps).toBe(4);
    });

    it('holds a stretch at the far edge inside the last slice', async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await gap(ItemType.tickets, 1, 2, '2024-03-02T00:00:00Z');

      const health = await service.manifests();
      const slices = health[0]!.slices;

      expect(slices[SLICE_COUNT - 1]!.gaps).toBe(2);
    });
  });

  describe('measuring what a type holds', () => {
    it('reports the outer edges of what the type claims', async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await claiming(
        ItemType.tickets,
        '2024-03-04T00:00:00Z',
        '2024-03-05T00:00:00Z',
      );

      const health = await service.manifests();

      expect(health[0]!.startDate).toEqual(at('2024-03-01T00:00:00Z'));
      expect(health[0]!.endDate).toEqual(at('2024-03-05T00:00:00Z'));
    });

    it('reaches across every type, so the marks line up between them', async () => {
      await claiming(
        ItemType.tickets,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await claiming(
        ItemType.flags,
        '2024-01-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );

      const health = await service.manifests();

      expect(new Set(health.map((item) => item.reach)).size).toBe(1);
    });

    it('puts the emptiest type first', async () => {
      await claiming(
        ItemType.tickets,
        '2024-01-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );
      await claiming(
        ItemType.flags,
        '2024-03-01T00:00:00Z',
        '2024-03-02T00:00:00Z',
      );

      const health = await service.manifests();

      expect(health[0]!.type).toBe(ItemType.flags);
    });
  });
});
