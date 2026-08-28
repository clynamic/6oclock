import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_logs')
export class JobLogEntity {
  constructor(partial?: Partial<JobLogEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  jobId: string;

  @Column({ type: 'timestamptz' })
  @Index()
  at: Date;

  @Column({ type: 'text' })
  level: string;

  @Column({ type: 'text', nullable: true })
  context: string | null;

  @Column({ type: 'jsonb' })
  record: Record<string, unknown>;
}
