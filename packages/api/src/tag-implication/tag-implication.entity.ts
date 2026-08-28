import { TagImplication } from 'src/api';
import {
  TagRelationshipStatus,
  convertKeysToCamelCase,
  parseTagRelationshipStatus,
} from 'src/common';
import { ItemType, LabelEntity, LabelLink } from 'src/label/label.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(ItemType.tagImplications)
export class TagImplicationEntity extends LabelLink {
  constructor(partial?: Partial<TagImplicationEntity>) {
    super();
    Object.assign(this, partial);
  }

  static fromTagImplication(value: TagImplication): TagImplicationEntity {
    const { status, errorMessage } = parseTagRelationshipStatus(value.status);
    return new TagImplicationEntity({
      ...convertKeysToCamelCase(value),
      status,
      errorMessage,
      label: new TagImplicationLabelEntity(value),
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

  @Column({ type: 'simple-array', nullable: true })
  descendantNames: string[] | null;

  @Column({ type: 'int', nullable: true })
  forumPostId: number | null;

  @Column({ type: 'int', nullable: true })
  forumTopicId: number | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'simple-enum', enum: TagRelationshipStatus })
  status: TagRelationshipStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;
}

export class TagImplicationLabelEntity extends LabelEntity {
  constructor(value: TagImplication) {
    super({
      id: `/${ItemType.tagImplications}/${value.id}`,
    });
  }
}
