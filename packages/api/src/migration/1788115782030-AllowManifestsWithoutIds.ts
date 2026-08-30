import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowManifestsWithoutIds1788115782030 implements MigrationInterface {
  name = 'AllowManifestsWithoutIds1788115782030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "manifests" ALTER COLUMN "lower_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "manifests" ALTER COLUMN "upper_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "manifests" ALTER COLUMN "upper_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "manifests" ALTER COLUMN "lower_id" SET NOT NULL`,
    );
  }
}
