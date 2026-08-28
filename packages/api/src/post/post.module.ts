import { Module } from '@nestjs/common';

import { PostMetricModule } from './metric/post-metric.module';
import { PostReviewModule } from './review/post-review.module';

@Module({
  imports: [PostMetricModule, PostReviewModule],
})
export class PostModule {}
