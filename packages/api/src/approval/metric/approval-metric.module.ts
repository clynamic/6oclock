import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { UserHeadModule } from 'src/user/head/user-head.module';
import { SystemUserModule } from 'src/user/system/system-user.module';

import { ApprovalMetricController } from './approval-metric.controller';
import { ApprovalMetricService } from './approval-metric.service';

@Module({
  imports: [
    SystemUserModule,
    TypeOrmModule.forFeature([PostEventEntity]),
    UserHeadModule,
  ],
  controllers: [ApprovalMetricController],
  providers: [ApprovalMetricService],
  exports: [ApprovalMetricService],
})
export class ApprovalMetricModule {}
