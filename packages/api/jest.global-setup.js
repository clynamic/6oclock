const { PostgreSqlContainer } = require('@testcontainers/postgresql');

const POSTGRES_IMAGE = 'postgres:17';

module.exports = async () => {
  process.env.TZ = 'UTC';
  process.env.E621_GLOBAL_USERNAME = 'jest_test_user_placeholder';
  process.env.E621_GLOBAL_API_KEY = 'abcdef0123456789abcdef0123456789';

  if (process.env.SKIP_TEST_POSTGRES) return;

  const postgres = await new PostgreSqlContainer(POSTGRES_IMAGE).start();

  globalThis.__TEST_POSTGRES__ = postgres;

  process.env.TEST_POSTGRES_HOST = postgres.getHost();
  process.env.TEST_POSTGRES_PORT = String(postgres.getPort());
  process.env.TEST_POSTGRES_USER = postgres.getUsername();
  process.env.TEST_POSTGRES_PASSWORD = postgres.getPassword();
  process.env.TEST_POSTGRES_DATABASE = postgres.getDatabase();
};
