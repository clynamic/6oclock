import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invalidates } from 'src/app/browser.module';
import { Repository } from 'typeorm';

import { FlagHandling, FlagLifecycleEntity } from './flag-lifecycle.entity';

export interface FlagEpisodeData {
  postId: number;
  flaggedAt: Date;
  handledAt: Date | null;
  handlerId: number | null;
  handling: FlagHandling | null;
}

@Injectable()
export class FlagLifecycleService {
  constructor(
    @InjectRepository(FlagLifecycleEntity)
    private readonly lifecycleRepository: Repository<FlagLifecycleEntity>,
  ) {}

  @Invalidates(FlagLifecycleEntity)
  async upsertEpisodes(data: FlagEpisodeData[]): Promise<void> {
    if (data.length === 0) return;

    await this.lifecycleRepository
      .createQueryBuilder()
      .insert()
      .into(FlagLifecycleEntity)
      .values(
        data.map((d) => ({
          postId: d.postId,
          flaggedAt: d.flaggedAt,
          handledAt: d.handledAt,
          handlerId: d.handlerId,
          handling: d.handling,
        })),
      )
      .orUpdate(
        ['handled_at', 'handler_id', 'handling', 'updated_at'],
        ['post_id', 'flagged_at'],
      )
      .execute();
  }

  @Invalidates(FlagLifecycleEntity)
  async wipe(): Promise<void> {
    await this.lifecycleRepository.clear();
  }
}
