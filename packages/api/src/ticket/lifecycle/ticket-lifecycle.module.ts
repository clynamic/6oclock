import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobModule } from 'src/job/job.module';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';

import { TicketEntity } from '../ticket.entity';
import { TicketLifecycleEntity } from './ticket-lifecycle.entity';
import { TicketLifecycleService } from './ticket-lifecycle.service';
import { TicketLifecycleWorker } from './ticket-lifecycle.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketLifecycleEntity,
      ModActionEntity,
      TicketEntity,
      ManifestEntity,
    ]),
    JobModule,
  ],
  providers: [TicketLifecycleService, TicketLifecycleWorker],
  exports: [TicketLifecycleService],
})
export class TicketLifecycleModule {}
