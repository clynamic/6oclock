import { PostFlag, PostFlagType } from 'src/api';
import { convertKeysToCamelCase } from 'src/common';
import { ItemType, LabelEntity, LabelLink } from 'src/label/label.entity';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity(ItemType.flags)
export class FlagEntity extends LabelLink {
  constructor(partial?: Partial<FlagEntity>) {
    super();
    Object.assign(this, partial);
  }

  static fromFlag(value: PostFlag): FlagEntity {
    // flaggers are hidden from members, but not staff.
    if (value.creator_id === undefined) {
      throw new Error(`Flag ${value.id} has no visible creator`);
    }
    return new FlagEntity({
      ...convertKeysToCamelCase(value),
      creatorId: value.creator_id,
      label: new FlagLabelEntity(value),
    });
  }

  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  creatorId: number;

  @Column({ type: 'int' })
  @Index()
  postId: number;

  /**
   * Don't trust this shitty-ass field. It means _nothing_. Ignore it.
   */
  @Column({ type: 'boolean' })
  isResolved: boolean;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'simple-enum', enum: PostFlagType })
  type: PostFlagType;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'timestamptz' })
  @Index()
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}

export class FlagLabelEntity extends LabelEntity {
  constructor(value: PostFlag) {
    super({
      id: `/${ItemType.flags}/${value.id}`,
    });
  }
}
