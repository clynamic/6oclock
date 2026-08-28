import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TechnicianGuard } from 'src/auth/auth.guard';
import { CursorParams, PartialDateRange, TileType } from 'src/common';

import { TileHealth } from './tile-health.dto';
import { TileHealthService } from './tile-health.service';

@ApiTags('Health')
@Controller('health/tiles')
export class TileHealthController {
  constructor(private readonly tileHealthService: TileHealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve tile health',
    description: 'Derived tiles and gaps for each tile type',
    operationId: 'getTileHealth',
  })
  @ApiResponse({
    status: 200,
    description: 'Tile health information',
    type: [TileHealth],
  })
  @UseGuards(TechnicianGuard)
  @ApiBearerAuth()
  async getTileHealth(
    @Query() cursor?: CursorParams,
    @Query() range?: PartialDateRange,
  ): Promise<TileHealth[]> {
    return this.tileHealthService.tiles(cursor, range);
  }

  // This is kind of awkward, being handled in the health controller.
  @Delete(':type')
  @ApiOperation({
    summary: 'Delete all tiles of a type',
    description: 'Delete all tiles of the specified type',
    operationId: 'deleteTilesByType',
  })
  @ApiParam({
    name: 'type',
    enum: TileType,
    description: 'The type of tiles to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Tiles deleted successfully',
  })
  @UseGuards(TechnicianGuard)
  @ApiBearerAuth()
  async deleteTilesByType(
    @Param('type') type: TileType,
    @Query() range?: PartialDateRange,
  ): Promise<void> {
    return this.tileHealthService.deleteTilesByType(type, range);
  }
}
