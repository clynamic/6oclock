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
  async syncEpisodes(
    postIds: number[],
    data: PostReviewEpisodeData[],
  ): Promise<void> {
    if (postIds.length === 0) return;

    await this.upsertEpisodes(data);
    await this.pruneEpisodes(postIds, data);
  }

  private async pruneEpisodes(
    postIds: number[],
    kept: PostReviewEpisodeData[],
  ): Promise<void> {
    const table = this.episodeRepository.metadata.tableName;

    await this.episodeRepository
      .createQueryBuilder()
      .delete()
      .from(PostReviewEpisodeEntity)
      .where('post_id = ANY(:postIds::int[])', { postIds })
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM unnest(:keptIds::int[], :keptTimes::timestamptz[]) AS kept(post_id, entered_at)
          WHERE kept.post_id = ${table}.post_id
            AND kept.entered_at = ${table}.entered_at
        )`,
        {
          keptIds: kept.map((episode) => episode.postId),
          keptTimes: kept.map((episode) => episode.enteredAt),
        },
      )
      .execute();
  }

  @Invalidates(PostReviewEpisodeEntity)
  async wipe(): Promise<void> {
    await this.episodeRepository.clear();
  }
}
