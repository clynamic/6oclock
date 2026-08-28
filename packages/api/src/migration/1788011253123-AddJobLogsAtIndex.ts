import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobLogsAtIndex1788011253123 implements MigrationInterface {
  name = 'AddJobLogsAtIndex1788011253123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_job_logs_at" ON "job_logs" ("at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_job_logs_at"`);
  }
}
