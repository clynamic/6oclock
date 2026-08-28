import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHeadModule } from 'src/user/head/user-head.module';
import { SystemUserModule } from 'src/user/system/system-user.module';

import { TicketEntity } from '../ticket.entity';
import { TicketMetricController } from './ticket-metric.controller';
import { TicketMetricService } from './ticket-metric.service';

@Module({
  imports: [
    SystemUserModule,
    TypeOrmModule.forFeature([TicketEntity]),
    UserHeadModule,
  ],
  controllers: [TicketMetricController],
  providers: [TicketMetricService],
  exports: [TicketMetricService],
})
export class TicketMetricModule {}
