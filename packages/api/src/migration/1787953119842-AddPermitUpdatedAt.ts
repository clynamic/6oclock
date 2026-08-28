import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermitUpdatedAt1787953119842 implements MigrationInterface {
  name = 'AddPermitUpdatedAt1787953119842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permits" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "permits" DROP COLUMN "updated_at"`);
  }
}
