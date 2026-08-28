import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobModule } from 'src/job/job.module';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PermitEntity } from 'src/permit/permit.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';

import { PostReviewEpisodeEntity } from './post-review.entity';
import { PostReviewService } from './post-review.service';
import { PostReviewWorker } from './post-review.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostReviewEpisodeEntity,
      PostEventEntity,
      PostVersionEntity,
      PermitEntity,
      ManifestEntity,
    ]),
    JobModule,
  ],
  providers: [PostReviewService, PostReviewWorker],
  exports: [PostReviewService],
})
export class PostReviewModule {}
