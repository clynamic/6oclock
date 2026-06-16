import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'pgboss', name: 'job', synchronize: false })
export class PgBossJobEntity {
  @PrimaryColumn('text')
  name: string;

  @PrimaryColumn('uuid')
  id: string;

  @Column('text')
  state: string;

  @Column('jsonb', { nullable: true })
  data: { handlerId?: string } | null;

  @Column('timestamptz', { name: 'start_after' })
  startAfter: Date;

  @Column('timestamptz', { name: 'started_on', nullable: true })
  startedOn: Date | null;

  @Column('timestamptz', { name: 'completed_on', nullable: true })
  completedOn: Date | null;

  @Column('jsonb', { nullable: true })
  output: { message?: string } | null;
}
