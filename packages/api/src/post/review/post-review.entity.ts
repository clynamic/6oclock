import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PostReviewExit {
  approved = 'approved',
  deleted = 'deleted',
}

@Entity('post_review_episodes')
@Index(['enteredAt'])
@Index(['exitedAt'])
export class PostReviewEpisodeEntity {
  constructor(partial?: Partial<PostReviewEpisodeEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'int' })
  postId: number;

  @PrimaryColumn({ type: 'timestamptz' })
  enteredAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  exitedAt: Date | null;

  @Column({ type: 'simple-enum', enum: PostReviewExit, nullable: true })
  exit: PostReviewExit | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
