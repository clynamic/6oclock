import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_API_LIMIT } from 'src/api/http/params';

import { Raw } from './raw';

/**
 * Reads a page by the marker its last row carried.
 *
 * Rows arriving at the head shift every offset behind them, so a list that
 * grows while it is read repeats or skips rows under page numbers.
 */
export class CursorParams {
  constructor(value?: Raw<CursorParams>) {
    Object.assign(this, value);
  }

  static DEFAULT_PAGE_SIZE = 20;

  @ApiProperty({
    description: 'Marker the last row of the page above carried',
    required: false,
  })
  @IsOptional()
  @IsString()
  before?: string;

  @ApiProperty({
    description: 'Page size',
    required: false,
    default: CursorParams.DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_API_LIMIT)
  @Type(() => Number)
  limit?: number;
}
