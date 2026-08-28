import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ticket_lifecycle')
@Index(['handlerId', 'resolvedAt'])
@Index(['createdAt'])
@Index(['resolvedAt'])
export class TicketLifecycleEntity {
  constructor(partial?: Partial<TicketLifecycleEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'int' })
  ticketId: number;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'int' })
  creatorId: number;

  @Column({ type: 'timestamptz', nullable: true })
  claimedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  claimantId: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  partialAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  handlerId: number | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
