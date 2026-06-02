import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobModule } from 'src/job/job.module';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';

import { FlagLifecycleEntity } from './flag-lifecycle.entity';
import { FlagLifecycleService } from './flag-lifecycle.service';
import { FlagLifecycleWorker } from './flag-lifecycle.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagLifecycleEntity,
      PostEventEntity,
      ManifestEntity,
    ]),
    JobModule,
  ],
  providers: [FlagLifecycleService, FlagLifecycleWorker],
  exports: [FlagLifecycleService],
})
export class FlagLifecycleModule {}
