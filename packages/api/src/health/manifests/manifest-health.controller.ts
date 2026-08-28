import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TechnicianGuard } from 'src/auth/auth.guard';

import { ManifestHealth } from './manifest-health.dto';
import { ManifestHealthService } from './manifest-health.service';

@ApiTags('Health')
@Controller('health/manifests')
export class ManifestHealthController {
  constructor(private readonly manifestHealthService: ManifestHealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve manifest health',
    description: 'Coverage and gaps for each item type',
    operationId: 'getManifestHealth',
  })
  @ApiResponse({
    status: 200,
    description: 'Manifest health',
    type: [ManifestHealth],
  })
  @UseGuards(TechnicianGuard)
  @ApiBearerAuth()
  async getManifestHealth(): Promise<ManifestHealth[]> {
    return this.manifestHealthService.manifests();
  }
}
