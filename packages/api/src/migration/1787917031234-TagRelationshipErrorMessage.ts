import { MigrationInterface, QueryRunner } from 'typeorm';

export class TagRelationshipErrorMessage1787917031234 implements MigrationInterface {
  name = 'TagRelationshipErrorMessage1787917031234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tag_implications" ADD "error_message" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" ADD "error_message" text`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tag_implications_status_enum" RENAME TO "tag_implications_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_implications_status_enum" AS ENUM('active', 'deleted', 'pending', 'processing', 'queued', 'retired', 'error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_implications" ALTER COLUMN "status" TYPE "public"."tag_implications_status_enum" USING "status"::"text"::"public"."tag_implications_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tag_implications_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tag_aliases_status_enum" RENAME TO "tag_aliases_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_aliases_status_enum" AS ENUM('active', 'deleted', 'pending', 'processing', 'queued', 'retired', 'error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" ALTER COLUMN "status" TYPE "public"."tag_aliases_status_enum" USING "status"::"text"::"public"."tag_aliases_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tag_aliases_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tag_aliases_status_enum_old" AS ENUM('approved', 'active', 'pending', 'deleted', 'retired', 'processing', 'queued')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" ALTER COLUMN "status" TYPE "public"."tag_aliases_status_enum_old" USING "status"::"text"::"public"."tag_aliases_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tag_aliases_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."tag_aliases_status_enum_old" RENAME TO "tag_aliases_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_implications_status_enum_old" AS ENUM('approved', 'active', 'pending', 'deleted', 'retired', 'processing', 'queued')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_implications" ALTER COLUMN "status" TYPE "public"."tag_implications_status_enum_old" USING "status"::"text"::"public"."tag_implications_status_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tag_implications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tag_implications_status_enum_old" RENAME TO "tag_implications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" DROP COLUMN "error_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_implications" DROP COLUMN "error_message"`,
    );
  }
}
