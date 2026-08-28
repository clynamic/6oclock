import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permit_hourly_tiles')
@Index(['time'])
export class PermitTilesEntity {
  constructor(partial?: Partial<PermitTilesEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'timestamptz' })
  time: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  count: number;
}

export type PermitTilesData = Pick<PermitTilesEntity, 'count'>;
