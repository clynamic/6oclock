import { TagAlias } from 'src/api';
import {
  TagRelationshipStatus,
  convertKeysToCamelCase,
  parseTagRelationshipStatus,
} from 'src/common';
import { ItemType, LabelEntity, LabelLink } from 'src/label/label.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(ItemType.tagAliases)
export class TagAliasEntity extends LabelLink {
  constructor(partial?: Partial<TagAliasEntity>) {
    super();
    Object.assign(this, partial);
  }

  static fromTagAlias(value: TagAlias): TagAliasEntity {
    const { status, errorMessage } = parseTagRelationshipStatus(value.status);
    return new TagAliasEntity({
      ...convertKeysToCamelCase(value),
      status,
      errorMessage,
      label: new TagAliasLabelEntity(value),
    });
  }

  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'int' })
  creatorId: number;

  @Column({ type: 'int', nullable: true })
  approverId: number | null;

  @Column({ type: 'text' })
  antecedentName: string;

  @Column({ type: 'text' })
  consequentName: string;

  @Column({ type: 'int', nullable: true })
  forumPostId: number | null;

  @Column({ type: 'int', nullable: true })
  forumTopicId: number | null;

  @Column({ type: 'int', nullable: true })
  postCount: number | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'simple-enum', enum: TagRelationshipStatus })
  status: TagRelationshipStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;
}

export class TagAliasLabelEntity extends LabelEntity {
  constructor(value: TagAlias) {
    super({
      id: `/${ItemType.tagAliases}/${value.id}`,
    });
  }
}
