import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const POSTGRES_IMAGE = 'postgres:17';

export interface TestDatabaseOptions {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

let container: Promise<StartedPostgreSqlContainer> | undefined;

/**
 * A worker starts its own container only when jest's global setup did not, so a
 * suite still runs outside jest.
 */
export const postgresOptions = async (): Promise<TestDatabaseOptions> => {
  const host = process.env['TEST_POSTGRES_HOST'];

  if (host) {
    return {
      type: 'postgres',
      host,
      port: parseInt(process.env['TEST_POSTGRES_PORT']!, 10),
      username: process.env['TEST_POSTGRES_USER']!,
      password: process.env['TEST_POSTGRES_PASSWORD']!,
      database: process.env['TEST_POSTGRES_DATABASE']!,
    };
  }

  const postgres = await (container ??= new PostgreSqlContainer(
    POSTGRES_IMAGE,
  ).start());

  return {
    type: 'postgres',
    host: postgres.getHost(),
    port: postgres.getPort(),
    username: postgres.getUsername(),
    password: postgres.getPassword(),
    database: postgres.getDatabase(),
  };
};

export const migrationFiles = (): string[] => {
  const directory = path.join(__dirname, '..', 'migration');

  return fs
    .readdirSync(directory)
    .filter((name) => /^\d+-.*\.ts$/.test(name))
    .sort()
    .map((name) => path.join(directory, name));
};

export const createTestDatabase = async (
  name: string,
): Promise<TestDatabaseOptions> => {
  const options = await postgresOptions();

  const admin = new DataSource(options);
  await admin.initialize();
  await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.query(`ALTER DATABASE ${name} SET timezone TO 'UTC'`);
  await admin.destroy();

  return { ...options, database: name };
};

export const runMigrations = async (
  options: TestDatabaseOptions,
): Promise<void> => {
  const migrator = new DataSource({
    ...options,
    migrations: migrationFiles(),
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
  });

  await migrator.initialize();
  await migrator.runMigrations();
  await migrator.destroy();
};
