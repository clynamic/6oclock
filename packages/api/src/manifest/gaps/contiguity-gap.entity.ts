import { ItemType } from 'src/label/label.entity';
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('contiguity_gaps')
export class ContiguityGapEntity {
  constructor(partial?: Partial<ContiguityGapEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'simple-enum', enum: ItemType })
  type: ItemType;

  @PrimaryColumn({ type: 'int' })
  lowerId: number;

  @Column({ type: 'int' })
  upperId: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
