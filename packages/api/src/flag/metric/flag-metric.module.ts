import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEventEntity } from 'src/post-event/post-event.entity';

import { FlagLifecycleEntity } from '../lifecycle/flag-lifecycle.entity';
import { FlagMetricController } from './flag-metric.controller';
import { FlagMetricService } from './flag-metric.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEventEntity, FlagLifecycleEntity]),
  ],
  controllers: [FlagMetricController],
  providers: [FlagMetricService],
  exports: [FlagMetricService],
})
export class FlagMetricModule {}
