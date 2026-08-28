import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplacePostLifecycleWithReview1787937865877 implements MigrationInterface {
  name = 'ReplacePostLifecycleWithReview1787937865877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."post_review_episodes_exit_enum" AS ENUM('approved', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_review_episodes" ("post_id" integer NOT NULL, "entered_at" TIMESTAMP WITH TIME ZONE NOT NULL, "exited_at" TIMESTAMP WITH TIME ZONE, "exit" "public"."post_review_episodes_exit_enum", "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_17e509b4fd89aed5312b9469004" PRIMARY KEY ("post_id", "entered_at"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c04897d68aa4a29cc24781fa3" ON "post_review_episodes" ("exited_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4538f0ff259a305b4c0c39ccdd" ON "post_review_episodes" ("entered_at") `,
    );
    await queryRunner.query(`DROP TABLE "post_lifecycle"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4538f0ff259a305b4c0c39ccdd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c04897d68aa4a29cc24781fa3"`,
    );
    await queryRunner.query(`DROP TABLE "post_review_episodes"`);
    await queryRunner.query(
      `DROP TYPE "public"."post_review_episodes_exit_enum"`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_lifecycle" ("post_id" integer NOT NULL, "uploaded_at" TIMESTAMP WITH TIME ZONE, "approved_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "permitted_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5d5823871bcb925dafaf8bd1217" PRIMARY KEY ("post_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f01b0384610fe312d0734fde2c" ON "post_lifecycle" ("permitted_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_651dc390d8b9d55b368d4b0d6e" ON "post_lifecycle" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f39a0e7fa1d7263e1dcca02d67" ON "post_lifecycle" ("approved_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b15705d49a00bc4257c9042ceb" ON "post_lifecycle" ("uploaded_at") `,
    );
  }
}
