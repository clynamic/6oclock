import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContiguityGaps1788109805827 implements MigrationInterface {
  name = 'CreateContiguityGaps1788109805827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contiguity_gaps_type_enum" AS ENUM('tickets', 'posts', 'users', 'user_profiles', 'flags', 'appeals', 'feedbacks', 'post_versions', 'post_replacements', 'post_events', 'mod_actions', 'bulk_update_requests', 'tag_aliases', 'tag_implications', 'permits')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contiguity_gaps" ("type" "public"."contiguity_gaps_type_enum" NOT NULL, "lower_id" integer NOT NULL, "upper_id" integer NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_48b97c5b4063017566256295dfb" PRIMARY KEY ("type", "lower_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "contiguity_gaps"`);
    await queryRunner.query(`DROP TYPE "public"."contiguity_gaps_type_enum"`);
  }
}
