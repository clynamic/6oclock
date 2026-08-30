import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateManifestStamps1788103840410 implements MigrationInterface {
  name = 'CreateManifestStamps1788103840410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "manifest_stamps" ("target" text NOT NULL, "manifest_id" integer NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_34e0eedc2ea78278b893044b1d6" PRIMARY KEY ("target", "manifest_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "manifest_stamps"`);
  }
}
