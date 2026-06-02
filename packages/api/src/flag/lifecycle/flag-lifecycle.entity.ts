import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FlagHandling {
  removed = 'removed',
  deleted = 'deleted',
}

/**
 * One row per flagged episode: a post is flagged from `flaggedAt` until
 * `handledAt`, when `handlerId` either removed the flag or deleted the post.
 * A post may be flagged more than once over its life, hence the composite key.
 */
@Entity('flag_lifecycle')
@Index(['handlerId', 'handledAt'])
@Index(['flaggedAt'])
@Index(['handledAt'])
export class FlagLifecycleEntity {
  constructor(partial?: Partial<FlagLifecycleEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'int' })
  postId: number;

  @PrimaryColumn({ type: 'timestamptz' })
  flaggedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  handledAt: Date | null;

  @Column({ type: 'int', nullable: true })
  handlerId: number | null;

  @Column({ type: 'simple-enum', enum: FlagHandling, nullable: true })
  handling: FlagHandling | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
