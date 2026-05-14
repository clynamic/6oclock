import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { AppConfigKeys } from 'src/app/config.module';

import { JobController } from './job.controller';
import { JobDiscoveryService } from './job.discovery';
import { DefaultProcessor, TilingProcessor } from './job.processor';
import { JobService } from './job.service';

@Global()
@Module({
  imports: [
    DiscoveryModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get(AppConfigKeys.REDIS_HOST),
          port: config.get(AppConfigKeys.REDIS_PORT),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'default' }, { name: 'tiling' }),
  ],
  controllers: [JobController],
  providers: [
    JobService,
    JobDiscoveryService,
    DefaultProcessor,
    TilingProcessor,
  ],
  exports: [JobService, JobDiscoveryService],
})
export class JobModule {}
