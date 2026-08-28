import { Module } from '@nestjs/common';

import { PermitMetricModule } from './metric/permit-metric.module';
import { PermitTilesModule } from './tiles/permit-tiles.module';

@Module({
  imports: [PermitTilesModule, PermitMetricModule],
})
export class PermitModule {}
