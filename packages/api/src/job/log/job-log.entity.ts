import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_logs')
export class JobLogEntity {
  constructor(partial?: Partial<JobLogEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'uuid' })
  @Index('IDX_job_logs_job_id')
  jobId: string;

  @Column({ type: 'timestamptz' })
  @Index('IDX_job_logs_at')
  at: Date;

  @Column({ type: 'text' })
  level: string;

  @Column({ type: 'text', nullable: true })
  context: string | null;

  @Column({ type: 'jsonb' })
  record: Record<string, unknown>;
}
