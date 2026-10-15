import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/api/e621';
import { CacheManager } from 'src/app/browser.module';
import { LabelEntity } from 'src/label/label.entity';
import { createTestDatabase, runMigrations } from 'src/testing/postgres';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { NotableUserEntity } from '../notable-user.entity';
import { UserEntity, UserLabelEntity } from '../user.entity';
import { UserSyncService } from './user-sync.service';

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
const NOW = new Date('2024-06-01T12:00:00Z');

const upstream = (id: number): UserEntity =>
  new UserEntity({
    id,
    name: `user_${id}`,
    level: 20,
    levelString: 'Janitor',
    isBanned: false,
    avatarId: null,
    baseUploadLimit: 10,
    canApprovePosts: true,
    canUploadFree: true,
    createdAt: new Date('2020-01-01T00:00:00Z'),
    label: new UserLabelEntity({ id } as User),
  });

describe('UserSyncService against Postgres', () => {
  let moduleRef: TestingModule;
  let service: UserSyncService;
  let source: DataSource;

  beforeAll(async () => {
    const database = await createTestDatabase('six_oclock_test_user_sync');
    await runMigrations(database);

    moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          ...database,
          entities: [UserEntity, NotableUserEntity, LabelEntity],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([UserEntity, NotableUserEntity]),
      ],
      providers: [CacheManager, UserSyncService],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(UserSyncService);
    source = moduleRef.get(DataSource);
  }, 180000);

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    await source.query('TRUNCATE users, labels CASCADE');
    jest.useFakeTimers({
      now: NOW,
      doNotFake: [
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('refreshes a stale user when it is saved again', async () => {
    await service.create([upstream(500)]);
    await source.query(
      `UPDATE labels SET refreshed_at = $1 WHERE id = '/users/500'`,
      [new Date(NOW.getTime() - 8 * DAY)],
    );

    expect(await service.findOutdated([500], WEEK)).toEqual([500]);

    await service.create([upstream(500)]);

    expect(await service.findOutdated([500], WEEK)).toEqual([]);
  });
});
