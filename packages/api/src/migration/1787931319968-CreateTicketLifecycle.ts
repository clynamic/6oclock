import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketLifecycle1787931319968 implements MigrationInterface {
  name = 'CreateTicketLifecycle1787931319968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ticket_lifecycle" ("ticket_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "creator_id" integer NOT NULL, "claimed_at" TIMESTAMP WITH TIME ZONE, "claimant_id" integer, "partial_at" TIMESTAMP WITH TIME ZONE, "resolved_at" TIMESTAMP WITH TIME ZONE, "handler_id" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a817d1df00680f9d44add1fbb0c" PRIMARY KEY ("ticket_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21d824dbdf69b4fad85e670e29" ON "ticket_lifecycle" ("resolved_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9810d0f5ad0d96b01ed318394e" ON "ticket_lifecycle" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90f40ff855f85cd50961e09123" ON "ticket_lifecycle" ("handler_id", "resolved_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90f40ff855f85cd50961e09123"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9810d0f5ad0d96b01ed318394e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_21d824dbdf69b4fad85e670e29"`,
    );
    await queryRunner.query(`DROP TABLE "ticket_lifecycle"`);
  }
}
