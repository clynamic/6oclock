import { ApiProperty } from '@nestjs/swagger';
import { Raw } from 'src/common';
import { ItemType } from 'src/label/label.entity';

export class ManifestSlice {
  constructor(value: Raw<ManifestSlice>) {
    Object.assign(this, value);
  }

  startDate: Date;
  endDate: Date;

  available: number;
  unavailable: number;
  none: number;
  gaps: number;
}

export class ManifestHealth {
  constructor(value: Raw<ManifestHealth>) {
    Object.assign(this, value);
  }

  @ApiProperty({ enum: ItemType, enumName: 'ItemType' })
  type: ItemType;
  porous: boolean;
  parts: number;
  startDate: Date;
  endDate: Date;
  covered: number;
  reach: number;
  gaps: number;
  updatedAt: Date;
  slices: ManifestSlice[];
}
