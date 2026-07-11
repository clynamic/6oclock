import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity {
  constructor(partial?: Partial<SessionEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'text' })
  token: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'text' })
  username: string;

  @Column({ type: 'text' })
  level: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'int', nullable: true })
  accessTtlMs: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  standingCheckedAt: Date | null;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
