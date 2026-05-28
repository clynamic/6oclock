import { Appeal, AppealQtype, AppealStatus } from 'src/api/e621';
import { ItemType, LabelEntity, LabelLink } from 'src/label/label.entity';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity(ItemType.appeals)
export class AppealEntity extends LabelLink {
  constructor(partial?: Partial<AppealEntity>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  creatorId: number;

  @Column({ type: 'int', nullable: true })
  claimantId: number | null;

  @Column({ type: 'int', nullable: true })
  handlerId: number | null;

  @Column({ type: 'int', nullable: true })
  accusedId: number | null;

  @Column({ type: 'int' })
  dispId: number;

  @Column({ type: 'simple-enum', enum: AppealQtype })
  qtype: AppealQtype;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'simple-enum', enum: AppealStatus })
  @Index()
  status: AppealStatus;

  @Column({ type: 'timestamptz' })
  @Index()
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}

export class AppealLabelEntity extends LabelEntity {
  constructor(value: Appeal) {
    super({
      id: `/${ItemType.appeals}/${value.id}`,
    });
  }
}
