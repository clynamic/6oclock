import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const TEST_DATABASE = 'six_oclock_test_migrations';

const SYNC_ENUM_VALUES = 1780522564528;
const BEFORE_SYNC_ENUM_VALUES = 1780521051266;

const POSTGRES_IMAGE = 'postgres:17';

let postgres: StartedPostgreSqlContainer;

const migrationFiles = (upTo?: number): string[] =>
  fs
    .readdirSync(__dirname)
    .filter((name) => /^\d+-.*\.ts$/.test(name))
    .filter(
      (name) => upTo === undefined || parseInt(name.split('-')[0]!) <= upTo,
    )
    .sort()
    .map((name) => path.join(__dirname, name));

const rootSource = (): DataSource =>
  new DataSource({
    type: 'postgres',
    host: postgres.getHost(),
    port: postgres.getPort(),
    username: postgres.getUsername(),
    password: postgres.getPassword(),
    database: postgres.getDatabase(),
  });

const migrationSource = (upTo?: number): DataSource =>
  new DataSource({
    type: 'postgres',
    host: postgres.getHost(),
    port: postgres.getPort(),
    username: postgres.getUsername(),
    password: postgres.getPassword(),
    database: TEST_DATABASE,
    migrations: migrationFiles(upTo),
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
  });

const withRoot = async (statement: string): Promise<void> => {
  const root = rootSource();
  await root.initialize();
  await root.query(statement);
  await root.destroy();
};

const tableNames = async (source: DataSource): Promise<string[]> => {
  const rows: { table_name: string }[] = await source.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  return rows.map((row) => row.table_name);
};

const enumValues = async (
  source: DataSource,
  typeName: string,
): Promise<string[]> => {
  const rows: { enumlabel: string }[] = await source.query(
    `SELECT enumlabel FROM pg_enum
     JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
     WHERE pg_type.typname = $1
     ORDER BY enumsortorder`,
    [typeName],
  );
  return rows.map((row) => row.enumlabel);
};

const insertTagAlias = (source: DataSource, status: string): Promise<void> =>
  source.query(
    `INSERT INTO tag_aliases
       (id, created_at, updated_at, creator_id, antecedent_name, consequent_name, status)
     VALUES (1, now(), now(), 1, 'antecedent', 'consequent', $1)`,
    [status],
  );

describe('migrations against Postgres', () => {
  let source: DataSource;

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  }, 180000);

  afterAll(async () => {
    await postgres?.stop();
  });

  beforeEach(async () => {
    await withRoot(`DROP DATABASE IF EXISTS ${TEST_DATABASE} WITH (FORCE)`);
    await withRoot(`CREATE DATABASE ${TEST_DATABASE}`);
  }, 60000);

  afterEach(async () => {
    if (source?.isInitialized) await source.destroy();
    await withRoot(`DROP DATABASE IF EXISTS ${TEST_DATABASE} WITH (FORCE)`);
  }, 60000);

  it('runs every migration up from an empty database', async () => {
    source = migrationSource();
    await source.initialize();

    const applied = await source.runMigrations();

    expect(applied).toHaveLength(migrationFiles().length);
    expect(await tableNames(source)).toEqual(
      expect.arrayContaining([
        'flag_lifecycle',
        'manifests',
        'post_review_episodes',
        'sessions',
        'ticket_lifecycle',
        'tickets',
      ]),
    );
  }, 120000);

  it('runs every migration back down, leaving only its own bookkeeping', async () => {
    source = migrationSource();
    await source.initialize();

    const applied = await source.runMigrations();
    for (let step = 0; step < applied.length; step++) {
      await source.undoLastMigration();
    }

    expect(await tableNames(source)).toEqual(['migrations']);
  }, 120000);

  it('runs up again after a full rollback', async () => {
    source = migrationSource();
    await source.initialize();

    const applied = await source.runMigrations();
    for (let step = 0; step < applied.length; step++) {
      await source.undoLastMigration();
    }
    const reapplied = await source.runMigrations();

    expect(reapplied).toHaveLength(applied.length);
    expect(await tableNames(source)).toEqual(
      expect.arrayContaining(['ticket_lifecycle']),
    );
  }, 120000);

  describe('narrowing the tag relationship enums', () => {
    it('drops approved from the tag alias status values', async () => {
      source = migrationSource(SYNC_ENUM_VALUES);
      await source.initialize();
      await source.runMigrations();

      expect(await enumValues(source, 'tag_aliases_status_enum')).toEqual([
        'active',
        'pending',
        'deleted',
        'retired',
        'processing',
        'queued',
      ]);
    }, 120000);

    it('aborts when an approved tag alias survives', async () => {
      source = migrationSource(BEFORE_SYNC_ENUM_VALUES);
      await source.initialize();
      await source.runMigrations();
      await insertTagAlias(source, 'approved');
      await source.destroy();

      source = migrationSource(SYNC_ENUM_VALUES);
      await source.initialize();

      await expect(source.runMigrations()).rejects.toThrow(
        /invalid input value for enum/,
      );
    }, 120000);

    it('leaves the enum as it was when it aborts', async () => {
      source = migrationSource(BEFORE_SYNC_ENUM_VALUES);
      await source.initialize();
      await source.runMigrations();
      await insertTagAlias(source, 'approved');
      await source.destroy();

      source = migrationSource(SYNC_ENUM_VALUES);
      await source.initialize();
      await expect(source.runMigrations()).rejects.toThrow(
        /invalid input value for enum/,
      );

      expect(await enumValues(source, 'tag_aliases_status_enum')).toContain(
        'approved',
      );
    }, 120000);

    it('passes once no approved row is left', async () => {
      source = migrationSource(BEFORE_SYNC_ENUM_VALUES);
      await source.initialize();
      await source.runMigrations();
      await insertTagAlias(source, 'active');
      await source.destroy();

      source = migrationSource(SYNC_ENUM_VALUES);
      await source.initialize();
      await source.runMigrations();

      expect(await enumValues(source, 'tag_aliases_status_enum')).not.toContain(
        'approved',
      );
    }, 120000);
  });
});
