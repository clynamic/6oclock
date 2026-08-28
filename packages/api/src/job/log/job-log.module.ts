import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobLogEntity } from './job-log.entity';
import { JobLogService } from './job-log.service';
import { JobLogWorker } from './job-log.worker';

@Module({
  imports: [TypeOrmModule.forFeature([JobLogEntity])],
  providers: [JobLogService, JobLogWorker],
  exports: [JobLogService],
})
export class JobLogModule {}
