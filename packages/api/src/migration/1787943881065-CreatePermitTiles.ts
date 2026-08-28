import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermitTiles1787943881065 implements MigrationInterface {
  name = 'CreatePermitTiles1787943881065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permit_hourly_tiles" ("time" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_b68ee9553e6c1d5d9b4ffaa6199" PRIMARY KEY ("time"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b68ee9553e6c1d5d9b4ffaa619" ON "permit_hourly_tiles" ("time") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b68ee9553e6c1d5d9b4ffaa619"`,
    );
    await queryRunner.query(`DROP TABLE "permit_hourly_tiles"`);
  }
}
