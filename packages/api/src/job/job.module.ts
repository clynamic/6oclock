import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobBoss } from './job.boss';
import { JobController } from './job.controller';
import { JobDiscoveryService } from './job.discovery';
import { JobProcessor } from './job.processor';
import { JobService } from './job.service';
import { PgBossJobEntity } from './pgboss-job.entity';

@Global()
@Module({
  imports: [DiscoveryModule, TypeOrmModule.forFeature([PgBossJobEntity])],
  controllers: [JobController],
  providers: [JobBoss, JobService, JobDiscoveryService, JobProcessor],
  exports: [JobService, JobDiscoveryService],
})
export class JobModule {}
