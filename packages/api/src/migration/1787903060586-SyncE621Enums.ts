import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncE621Enums1787903060586 implements MigrationInterface {
  name = 'SyncE621Enums1787903060586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6890142eca00d1b59e9769e499"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_48b516ab6840c3426ab48c38fb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b4e1a022fec674ff14c799f3b6"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."post_events_action_enum" RENAME TO "post_events_action_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_events_action_enum" AS ENUM('deleted', 'undeleted', 'approved', 'unapproved', 'flag_created', 'flag_removed', 'favorites_moved', 'favorites_received', 'rating_locked', 'rating_unlocked', 'status_locked', 'status_unlocked', 'note_locked', 'note_unlocked', 'comment_locked', 'comment_unlocked', 'comment_disabled', 'comment_enabled', 'replacement_accepted', 'replacement_rejected', 'replacement_promoted', 'replacement_deleted', 'expunged', 'changed_bg_color', 'replacement_penalty_changed', 'owner_changed', 'replacement_moved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_events" ALTER COLUMN "action" TYPE "public"."post_events_action_enum" USING "action"::"text"::"public"."post_events_action_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."post_events_action_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."appeals_status_enum" RENAME TO "appeals_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appeals_status_enum" AS ENUM('pending', 'partial', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appeals" ALTER COLUMN "status" TYPE "public"."appeals_status_enum" USING "status"::"text"::"public"."appeals_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."appeals_status_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_6890142eca00d1b59e9769e499" ON "post_events" ("post_id", "action", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48b516ab6840c3426ab48c38fb" ON "post_events" ("creator_id", "action", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4e1a022fec674ff14c799f3b6" ON "post_events" ("action", "created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b4e1a022fec674ff14c799f3b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_48b516ab6840c3426ab48c38fb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6890142eca00d1b59e9769e499"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appeals_status_enum_old" AS ENUM('pending', 'partial', 'approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appeals" ALTER COLUMN "status" TYPE "public"."appeals_status_enum_old" USING "status"::"text"::"public"."appeals_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."appeals_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."appeals_status_enum_old" RENAME TO "appeals_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_events_action_enum_old" AS ENUM('deleted', 'undeleted', 'approved', 'unapproved', 'flag_created', 'flag_removed', 'favorites_moved', 'favorites_received', 'rating_locked', 'rating_unlocked', 'status_locked', 'status_unlocked', 'note_locked', 'note_unlocked', 'comment_locked', 'comment_unlocked', 'comment_disabled', 'comment_enabled', 'replacement_accepted', 'replacement_rejected', 'replacement_promoted', 'replacement_deleted', 'expunged', 'changed_bg_color', 'replacement_penalty_changed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_events" ALTER COLUMN "action" TYPE "public"."post_events_action_enum_old" USING "action"::"text"::"public"."post_events_action_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."post_events_action_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."post_events_action_enum_old" RENAME TO "post_events_action_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4e1a022fec674ff14c799f3b6" ON "post_events" ("action", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48b516ab6840c3426ab48c38fb" ON "post_events" ("creator_id", "action", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6890142eca00d1b59e9769e499" ON "post_events" ("post_id", "action", "created_at") `,
    );
  }
}
