import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncEnumValues1780522564528 implements MigrationInterface {
  name = 'SyncEnumValues1780522564528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."tag_implications_status_enum" RENAME TO "tag_implications_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_implications_status_enum" AS ENUM('active', 'pending', 'deleted', 'retired', 'processing', 'queued')`,
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
      `CREATE TYPE "public"."tag_aliases_status_enum" AS ENUM('active', 'pending', 'deleted', 'retired', 'processing', 'queued')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" ALTER COLUMN "status" TYPE "public"."tag_aliases_status_enum" USING "status"::"text"::"public"."tag_aliases_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tag_aliases_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."manifests_type_enum" RENAME TO "manifests_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."manifests_type_enum" AS ENUM('tickets', 'posts', 'users', 'user_profiles', 'flags', 'appeals', 'feedbacks', 'post_versions', 'post_replacements', 'post_events', 'mod_actions', 'bulk_update_requests', 'tag_aliases', 'tag_implications', 'permits')`,
    );
    await queryRunner.query(
      `ALTER TABLE "manifests" ALTER COLUMN "type" TYPE "public"."manifests_type_enum" USING "type"::"text"::"public"."manifests_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."manifests_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."manifests_type_enum_old" AS ENUM('tickets', 'posts', 'users', 'user_profiles', 'flags', 'feedbacks', 'post_versions', 'post_replacements', 'post_events', 'mod_actions', 'bulk_update_requests', 'tag_aliases', 'tag_implications', 'permits')`,
    );
    await queryRunner.query(
      `ALTER TABLE "manifests" ALTER COLUMN "type" TYPE "public"."manifests_type_enum_old" USING "type"::"text"::"public"."manifests_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."manifests_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."manifests_type_enum_old" RENAME TO "manifests_type_enum"`,
    );
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
  }
}
