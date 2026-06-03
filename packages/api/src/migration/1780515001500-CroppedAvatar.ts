import { MigrationInterface, QueryRunner } from 'typeorm';

export class CroppedAvatar1780515001500 implements MigrationInterface {
  name = 'CroppedAvatar1780515001500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "has_cropped_avatar" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "has_cropped_avatar"`,
    );
  }
}
