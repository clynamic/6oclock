import { Module } from '@nestjs/common';

import { TicketLifecycleModule } from './lifecycle/ticket-lifecycle.module';
import { TicketMetricModule } from './metric/ticket-metric.module';
import { TicketSyncModule } from './sync/ticket-sync.module';

@Module({
  imports: [TicketSyncModule, TicketMetricModule, TicketLifecycleModule],
})
export class TicketModule {}
