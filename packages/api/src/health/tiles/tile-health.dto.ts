import { ApiProperty } from '@nestjs/swagger';
import { Raw, TileType } from 'src/common';

export class TileSlice {
  constructor(value: Raw<TileSlice>) {
    Object.assign(this, value);
  }

  startDate: Date;
  endDate: Date;

  /** Tiles this slice holds. */
  available: number;

  /** Tiles this slice is owed and does not hold. */
  unavailable: number;

  /** Tiles no source covers, so none are owed. */
  none: number;
}

/**
 * What one tile type has derived, against what its sources allow.
 *
 * A tile is owed wherever every source covers the hour, so the health of a type
 * is that debt measured against what it actually holds.
 */
export class TileHealth {
  constructor(value: Raw<TileHealth>) {
    Object.assign(this, value);
  }

  @ApiProperty({ enum: TileType, enumName: 'TileType' })
  type: TileType;

  /** Stretches the sources cover between them. */
  ranges: number;

  /** First hour any source covers. */
  startDate: Date;

  /** Last hour any source covers. */
  endDate: Date;

  /** Tiles the sources ask for. */
  expected: number;

  /** Tiles that exist and are no older than their sources. */
  actual: number;

  slices: TileSlice[];

  /** The same accounting per calendar month, which is the unit tiles delete in. */
  months: TileSlice[];
}
