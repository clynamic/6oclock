import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppeals1779986367225 implements MigrationInterface {
  name = 'CreateAppeals1779986367225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appeals_qtype_enum" AS ENUM('flag')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appeals_status_enum" AS ENUM('pending', 'partial', 'approved')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appeals" ("id" integer NOT NULL, "creator_id" integer NOT NULL, "claimant_id" integer, "handler_id" integer, "accused_id" integer, "disp_id" integer NOT NULL, "qtype" "public"."appeals_qtype_enum" NOT NULL, "reason" text NOT NULL, "response" text NOT NULL, "status" "public"."appeals_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "label_id" text, CONSTRAINT "REL_a6519c8523e67945d84888ab0e" UNIQUE ("label_id"), CONSTRAINT "PK_ebd2050a02aa78081b5346152bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cc22e1f032a36f97fba02462e5" ON "appeals" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac46f7fa5563efc128bd6e3b50" ON "appeals" ("created_at") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notable_users_type_enum" RENAME TO "notable_users_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notable_users_type_enum" AS ENUM('staff', 'reporter', 'uploader', 'appellant')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notable_users" ALTER COLUMN "type" TYPE "public"."notable_users_type_enum" USING "type"::"text"::"public"."notable_users_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notable_users_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "appeals" ADD CONSTRAINT "FK_a6519c8523e67945d84888ab0ea" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appeals" DROP CONSTRAINT "FK_a6519c8523e67945d84888ab0ea"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notable_users_type_enum_old" AS ENUM('staff', 'reporter', 'uploader')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notable_users" ALTER COLUMN "type" TYPE "public"."notable_users_type_enum_old" USING "type"::"text"::"public"."notable_users_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notable_users_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notable_users_type_enum_old" RENAME TO "notable_users_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac46f7fa5563efc128bd6e3b50"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc22e1f032a36f97fba02462e5"`,
    );
    await queryRunner.query(`DROP TABLE "appeals"`);
    await queryRunner.query(`DROP TYPE "public"."appeals_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appeals_qtype_enum"`);
  }
}
