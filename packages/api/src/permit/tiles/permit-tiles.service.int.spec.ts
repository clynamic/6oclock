import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { PostRating } from 'src/api/e621';
import { CacheManager } from 'src/app/browser.module';
import { AppConfigKeys } from 'src/app/config.module';
import { DateRange, TimeScale } from 'src/common';
import { ItemType, LabelEntity } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { createTestDatabase, runMigrations } from 'src/testing/postgres';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { PermitEntity } from '../permit.entity';
import { PermitTilesEntity } from './permit-tiles.entity';
import { PermitTilesService } from './permit-tiles.service';

const DELETION_WINDOW_DAYS = 5;
const REVIEW_PERIOD_DAYS = DELETION_WINDOW_DAYS + 2;

const hoursAgo = (hours: number): Date => {
  const when = new Date(Date.now() - hours * 60 * 60 * 1000);
  when.setUTCMinutes(0, 0, 0);
  return when;
};

const daysAgo = (days: number): Date => hoursAgo(days * 24);

describe('PermitTilesService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: PermitTilesService;
  let versions: Repository<PostVersionEntity>;
  let events: Repository<PostEventEntity>;
  let permits: Repository<PermitEntity>;
  let tiles: Repository<PermitTilesEntity>;
  let manifests: Repository<ManifestEntity>;
  let source: DataSource;
  let nextId = 1;

  const upload = (postId: number, when: Date, version = 1): Promise<unknown> =>
    versions.insert({
      id: nextId++,
      postId,
      version,
      updatedAt: when,
      updaterId: 700,
      updaterName: 'uploader',
      description: '',
      descriptionChanged: false,
      rating: PostRating.s,
      ratingChanged: false,
      source: '',
      sourceChanged: false,
      parentId: null,
      parentChanged: false,
    });

  const event = (
    postId: number,
    action: PostEventAction,
    when: Date,
  ): Promise<unknown> =>
    events.insert({
      id: nextId++,
      postId,
      creatorId: 900,
      action,
      createdAt: when,
    });

  const permittedIds = async (): Promise<number[]> =>
    permits
      .find({ order: { id: 'ASC' } })
      .then((rows) => rows.map((r) => r.id));

  beforeAll(async () => {
    const database = await createTestDatabase('six_oclock_test_permit_tiles');
    await runMigrations(database);

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          ...database,
          entities: [
            PermitEntity,
            PermitTilesEntity,
            ManifestEntity,
            PostVersionEntity,
            PostEventEntity,
            LabelEntity,
          ],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          PermitEntity,
          PermitTilesEntity,
          ManifestEntity,
        ]),
      ],
      providers: [
        CacheManager,
        PermitTilesService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) =>
              key === AppConfigKeys.E621_UNAPPROVED_POST_DELETION_WINDOW_DAYS
                ? DELETION_WINDOW_DAYS
                : undefined,
          },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(PermitTilesService);
    permits = moduleRef.get(getRepositoryToken(PermitEntity));
    tiles = moduleRef.get(getRepositoryToken(PermitTilesEntity));
    source = moduleRef.get(DataSource);
    manifests = source.getRepository(ManifestEntity);
    versions = source.getRepository(PostVersionEntity);
    events = source.getRepository(PostEventEntity);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    await source.query(
      'TRUNCATE permits, permit_hourly_tiles, post_versions, post_events, labels, manifests CASCADE',
    );
    nextId = 1;
  });

  describe('what counts as a permit', () => {
    it('refuses a later edit, since only the first version is the upload', async () => {
      const when = hoursAgo(2);
      await upload(11, when, 2);

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('refuses an upload somebody approved, since it needed approval', async () => {
      const when = hoursAgo(2);
      await upload(12, when);
      await event(12, PostEventAction.approved, hoursAgo(1));

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('takes an upload somebody unapproved, since surviving the window means it left the queue again', async () => {
      const when = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await upload(13, when);
      await event(13, PostEventAction.unapproved, daysAgo(REVIEW_PERIOD_DAYS));

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([13]);
    });

    it('refuses an upload somebody approved after unapproving it', async () => {
      const when = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await upload(15, when);
      await event(15, PostEventAction.unapproved, daysAgo(REVIEW_PERIOD_DAYS));
      await event(15, PostEventAction.approved, daysAgo(1));

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('refuses an upload deleted inside the review period', async () => {
      const when = daysAgo(30);
      await upload(14, when);
      await event(
        14,
        PostEventAction.deleted,
        daysAgo(30 - (REVIEW_PERIOD_DAYS - 1)),
      );

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('refuses an upload still inside its review period', async () => {
      const when = hoursAgo(2);
      await upload(16, when);

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([]);
    });
  });

  describe('the two exits a permit cannot tell apart', () => {
    it('takes the upload that never needed approving and the one approved without a trace alike', async () => {
      const when = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await upload(31, when);
      await upload(32, when);
      await event(32, PostEventAction.unapproved, daysAgo(REVIEW_PERIOD_DAYS));

      await service.derive([when]);

      await expect(permittedIds()).resolves.toEqual([31, 32]);
    });
  });

  describe('deriving a range that permits nothing', () => {
    it('writes nothing at all when handed no hours', async () => {
      const when = hoursAgo(2);
      await upload(23, when);

      await expect(service.derive([])).resolves.toBe(0);
      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('writes a zero tile for an hour nothing merged into', async () => {
      const when = hoursAgo(2);

      await service.derive([when]);

      const tile = await tiles.findOneBy({ time: when });
      expect(tile?.count).toBe(0);
    });
  });

  describe('an upload nothing objected to', () => {
    it('becomes a permit once its review period has passed', async () => {
      const when = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await upload(10, when);

      await expect(service.derive([when])).resolves.toBe(1);
      await expect(permittedIds()).resolves.toEqual([10]);
    });
  });

  describe('when permit tiles inside a manifest updated', () => {
    const claim = (startDate: Date, endDate: Date): Promise<ManifestEntity> =>
      manifests.save(
        new ManifestEntity({
          type: ItemType.postVersions,
          startDate,
          endDate,
        }),
      );

    const tile = (time: Date, updatedAt: Date): Promise<unknown> =>
      source.query(
        'INSERT INTO permit_hourly_tiles (time, updated_at, count) VALUES ($1, $2, 1)',
        [time, updatedAt],
      );

    it('reports the newest tile it covers', async () => {
      const manifest = await claim(daysAgo(3), daysAgo(1));
      await tile(daysAgo(2), daysAgo(2));
      await tile(hoursAgo(60), hoursAgo(1));

      const updated = await service.updatedAt([manifest]);

      expect(updated.get(manifest.id)).toEqual(hoursAgo(1));
    });

    it('ignores a tile outside the dates it claims', async () => {
      const manifest = await claim(daysAgo(3), daysAgo(2));
      await tile(daysAgo(1), hoursAgo(1));

      const updated = await service.updatedAt([manifest]);

      expect(updated.has(manifest.id)).toBe(false);
    });

    it('reports nothing for a manifest no tile falls into', async () => {
      const manifest = await claim(daysAgo(3), daysAgo(1));

      const updated = await service.updatedAt([manifest]);

      expect(updated.size).toBe(0);
    });
  });

  describe('an hour that matured after its tile was written', () => {
    const tile = (time: Date, updatedAt: Date): Promise<unknown> =>
      source.query(
        'INSERT INTO permit_hourly_tiles (time, updated_at, count) VALUES ($1, $2, 0)',
        [time, updatedAt],
      );

    const oneHourFrom = (time: Date): DateRange =>
      new DateRange({
        startDate: time,
        endDate: new Date(time.getTime() + 60 * 60 * 1000),
        scale: TimeScale.Hour,
      });

    it('comes back once, since it was counted before its posts were decidable', async () => {
      const time = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await tile(time, time);

      const missing = await service.findMissing({
        dateRange: oneHourFrom(time),
      });

      expect(missing).toEqual([time]);
    });

    it('stays away once its tile was written after it matured', async () => {
      const time = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await tile(time, hoursAgo(1));

      const missing = await service.findMissing({
        dateRange: oneHourFrom(time),
      });

      expect(missing).toEqual([]);
    });

    it('waits while it is still too young to decide', async () => {
      const time = hoursAgo(2);
      await tile(time, time);

      const missing = await service.findMissing({
        dateRange: oneHourFrom(time),
      });

      expect(missing).toEqual([]);
    });

    it('comes back only once, since the pass that answers it moves the tile past maturity', async () => {
      const time = daysAgo(REVIEW_PERIOD_DAYS + 1);
      await tile(time, time);

      await service.derive([time]);
      const missing = await service.findMissing({
        dateRange: oneHourFrom(time),
      });

      expect(missing).toEqual([]);
    });
  });
});
