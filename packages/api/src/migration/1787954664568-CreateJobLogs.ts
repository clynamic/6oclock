import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobLogs1787954664568 implements MigrationInterface {
  name = 'CreateJobLogs1787954664568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "job_logs" ("id" BIGSERIAL NOT NULL, "job_id" uuid NOT NULL, "at" TIMESTAMP WITH TIME ZONE NOT NULL, "level" text NOT NULL, "context" text, "record" jsonb NOT NULL, CONSTRAINT "PK_job_logs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_job_logs_job_id" ON "job_logs" ("job_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_job_logs_job_id"`);
    await queryRunner.query(`DROP TABLE "job_logs"`);
  }
}
