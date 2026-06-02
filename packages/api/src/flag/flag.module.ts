import { Module } from '@nestjs/common';

import { FlagLifecycleModule } from './lifecycle/flag-lifecycle.module';
import { FlagMetricModule } from './metric/flag-metric.module';
import { FlagSyncModule } from './sync/flag-sync.module';

@Module({
  imports: [FlagLifecycleModule, FlagMetricModule, FlagSyncModule],
})
export class FlagModule {}
