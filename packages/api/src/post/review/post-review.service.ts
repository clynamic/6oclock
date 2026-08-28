import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invalidates } from 'src/app/browser.module';
import { Repository } from 'typeorm';

import { PostReviewEpisodeEntity } from './post-review.entity';
import { PostReviewEpisodeData } from './post-review.utils';

@Injectable()
export class PostReviewService {
  constructor(
    @InjectRepository(PostReviewEpisodeEntity)
    private readonly episodeRepository: Repository<PostReviewEpisodeEntity>,
  ) {}

  @Invalidates(PostReviewEpisodeEntity)
  async upsertEpisodes(data: PostReviewEpisodeData[]): Promise<void> {
    if (data.length === 0) return;

    await this.episodeRepository
      .createQueryBuilder()
      .insert()
      .into(PostReviewEpisodeEntity)
      .values(data)
      .orUpdate(['exited_at', 'exit', 'updated_at'], ['post_id', 'entered_at'])
      .execute();
  }

  @Invalidates(PostReviewEpisodeEntity)
  async wipe(): Promise<void> {
    await this.episodeRepository.clear();
  }
}
