import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import { PostEventAction } from 'src/api';
import { PostRating } from 'src/api/e621';
import { CacheManager } from 'src/app/browser.module';
import { AppConfigKeys } from 'src/app/config.module';
import { LabelEntity } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { DataSource, Repository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { PermitEntity } from '../permit.entity';
import { PermitTilesEntity } from './permit-tiles.entity';
import { PermitTilesService } from './permit-tiles.service';

const POSTGRES_IMAGE = 'postgres:17';

const DELETION_WINDOW_DAYS = 5;
const REVIEW_PERIOD_DAYS = DELETION_WINDOW_DAYS + 2;

let postgres: StartedPostgreSqlContainer;

const migrationFiles = (): string[] =>
  fs
    .readdirSync(path.join(__dirname, '..', '..', 'migration'))
    .filter((name) => /^\d+-.*\.ts$/.test(name))
    .sort()
    .map((name) => path.join(__dirname, '..', '..', 'migration', name));

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
    postgres = await new PostgreSqlContainer(POSTGRES_IMAGE).start();

    const migrator = new DataSource({
      type: 'postgres',
      host: postgres.getHost(),
      port: postgres.getPort(),
      username: postgres.getUsername(),
      password: postgres.getPassword(),
      database: postgres.getDatabase(),
      migrations: migrationFiles(),
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    });

    await migrator.initialize();
    await migrator.runMigrations();
    await migrator.destroy();

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgres.getHost(),
          port: postgres.getPort(),
          username: postgres.getUsername(),
          password: postgres.getPassword(),
          database: postgres.getDatabase(),
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
    versions = source.getRepository(PostVersionEntity);
    events = source.getRepository(PostEventEntity);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
    await postgres?.stop();
  });

  beforeEach(async () => {
    await source.query(
      'TRUNCATE permits, permit_hourly_tiles, post_versions, post_events, labels CASCADE',
    );
    nextId = 1;
  });

  describe('what counts as a permit', () => {
    it('refuses a later edit, since only the first version is the upload', async () => {
      const when = hoursAgo(2);
      await upload(11, when, 2);

      await service.derive([when], []);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('refuses an upload somebody approved, since it needed approval', async () => {
      const when = hoursAgo(2);
      await upload(12, when);
      await event(12, PostEventAction.approved, hoursAgo(1));

      await service.derive([when], []);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('refuses an upload somebody unapproved', async () => {
      const when = hoursAgo(2);
      await upload(13, when);
      await event(13, PostEventAction.unapproved, hoursAgo(1));

      await service.derive([when], []);

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

      await service.derive([when], []);

      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('refuses a young upload e621 still lists as pending', async () => {
      const when = hoursAgo(2);
      await upload(16, when);

      await service.derive([when], [16]);

      await expect(permittedIds()).resolves.toEqual([]);
    });
  });

  describe('deriving a range that permits nothing', () => {
    it('writes nothing at all when handed no hours', async () => {
      const when = hoursAgo(2);
      await upload(23, when);

      await expect(service.derive([], [])).resolves.toBe(0);
      await expect(permittedIds()).resolves.toEqual([]);
    });

    it('writes a zero tile for an hour nothing merged into', async () => {
      const when = hoursAgo(2);

      await service.derive([when], []);

      const tile = await tiles.findOneBy({ time: when });
      expect(tile?.count).toBe(0);
    });
  });

  describe('characterised, not specified', () => {
    it('cannot write a permit at all, since nothing creates its label row', async () => {
      const when = hoursAgo(2);
      await upload(10, when);

      await expect(service.derive([when], [])).rejects.toThrow(
        /violates foreign key constraint/,
      );
      await expect(permittedIds()).resolves.toEqual([]);
    });
  });
});
