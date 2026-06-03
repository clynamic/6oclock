import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFlagLifecycle1780521051266 implements MigrationInterface {
  name = 'CreateFlagLifecycle1780521051266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."flag_lifecycle_handling_enum" AS ENUM('removed', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "flag_lifecycle" ("post_id" integer NOT NULL, "flagged_at" TIMESTAMP WITH TIME ZONE NOT NULL, "handled_at" TIMESTAMP WITH TIME ZONE, "handler_id" integer, "handling" "public"."flag_lifecycle_handling_enum", "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1cc55463af36748aecd74846f9e" PRIMARY KEY ("post_id", "flagged_at"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08d03c529b91a448e56afc09d0" ON "flag_lifecycle" ("handled_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_154fcf6115a8aaa556f6a354f0" ON "flag_lifecycle" ("flagged_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3294c868d1b25b4ea335f848cf" ON "flag_lifecycle" ("handler_id", "handled_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3294c868d1b25b4ea335f848cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_154fcf6115a8aaa556f6a354f0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_08d03c529b91a448e56afc09d0"`,
    );
    await queryRunner.query(`DROP TABLE "flag_lifecycle"`);
    await queryRunner.query(`DROP TYPE "public"."flag_lifecycle_handling_enum"`);
  }
}
