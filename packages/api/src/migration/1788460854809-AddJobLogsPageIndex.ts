import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobLogsPageIndex1788460854809 implements MigrationInterface {
  name = 'AddJobLogsPageIndex1788460854809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_job_logs_job_id"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_job_logs_job_id_id" ON "job_logs" ("job_id", "id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_job_logs_job_id_id"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_job_logs_job_id" ON "job_logs" ("job_id") `,
    );
  }
}
