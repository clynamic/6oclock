import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthLevel, RolesGuard } from 'src/auth/auth.guard';
import { UserLevel } from 'src/auth/auth.level';
import { PartialDateRange, SeriesCountPoint } from 'src/common';

import { FlagMetricService } from './flag-metric.service';

@ApiTags('Flags')
@Controller('metrics/flags')
@UseGuards(RolesGuard)
@AuthLevel(UserLevel.Janitor)
@ApiBearerAuth()
export class FlagMetricController {
  constructor(private readonly flagMetricService: FlagMetricService) {}

  @Get('pending/series')
  @ApiOperation({
    summary: 'Flag pending series',
    description: 'Get flag pending series for a given date range',
    operationId: 'getFlagPendingSeries',
  })
  @ApiResponse({
    status: 200,
    type: [SeriesCountPoint],
  })
  async pendingSeries(
    @Query() range?: PartialDateRange,
  ): Promise<SeriesCountPoint[]> {
    return this.flagMetricService.pendingSeries(range);
  }
}
