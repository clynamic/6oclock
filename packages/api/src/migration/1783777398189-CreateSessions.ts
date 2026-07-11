import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessions1783777398189 implements MigrationInterface {
  name = 'CreateSessions1783777398189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" ("token" text NOT NULL, "user_id" integer NOT NULL, "username" text NOT NULL, "level" text NOT NULL, "refresh_token" text, "access_ttl_ms" integer, "standing_checked_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e9f62f5dcb8a54b84234c9e7a06" PRIMARY KEY ("token"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9cfe37d28c3b229a350e086d94" ON "sessions" ("expires_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9cfe37d28c3b229a350e086d94"`,
    );
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
