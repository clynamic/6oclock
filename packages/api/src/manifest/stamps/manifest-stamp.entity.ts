import { Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('manifest_stamps')
export class ManifestStampEntity {
  constructor(partial?: Partial<ManifestStampEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'text' })
  target: string;

  @PrimaryColumn({ type: 'int' })
  manifestId: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
