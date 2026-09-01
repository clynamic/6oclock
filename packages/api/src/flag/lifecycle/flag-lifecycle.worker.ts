import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { DateRange, chunkDateRange } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ManifestStampService } from 'src/manifest/stamps/manifest-stamp.service';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { Repository } from 'typeorm';

import { FlagHandling, FlagLifecycleEntity } from './flag-lifecycle.entity';
import {
  FlagEpisodeData,
  FlagLifecycleService,
} from './flag-lifecycle.service';

interface FlagEvent {
  post_id: number;
  created_at: Date;
  action: string;
  creator_id: number;
}

const FLAG_ACTIONS = [
  PostEventAction.flag_created,
  PostEventAction.flag_removed,
  PostEventAction.deleted,
];

@Injectable()
export class FlagLifecycleWorker {
  constructor(
    private readonly lifecycleService: FlagLifecycleService,
    private readonly stampService: ManifestStampService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(PostEventEntity)
    private readonly postEventRepository: Repository<PostEventEntity>,
  ) {}

  private readonly logger = new Logger(FlagLifecycleWorker.name);

  @JobHandler({
    id: 'flagLifecycle/postEvents',
    description: 'Rebuilds flag lifecycles from post events.',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runSync(job: Job) {
    const manifests = await this.stampService.pending(
      FlagLifecycleEntity,
      await this.manifestRepository.find({
        where: { type: ItemType.postEvents },
      }),
    );

    if (manifests.length === 0) return;

    for (const manifest of manifests) {
      await ensureActive(job);

      const range = new DateRange({
        startDate: manifest.startDate,
        endDate: manifest.endDate,
      });

      const chunks = chunkDateRange(range, 30);

      for (const chunk of chunks) {
        await ensureActive(job);

        // Episodes open and close outside the chunk.
        const events = await this.postEventRepository
          .createQueryBuilder('event')
          .select('event.postId', 'post_id')
          .addSelect('event.createdAt', 'created_at')
          .addSelect('event.action', 'action')
          .addSelect('event.creatorId', 'creator_id')
          .where('event.action IN (:...actions)')
          .andWhere((qb) => {
            const touched = qb
              .subQuery()
              .select('DISTINCT touch.postId')
              .from(PostEventEntity, 'touch')
              .where('touch.action IN (:...actions)')
              .andWhere('touch.createdAt >= :start')
              .andWhere('touch.createdAt < :end')
              .getQuery();

            return `event.post_id IN ${touched}`;
          })
          .setParameters({
            actions: FLAG_ACTIONS,
            start: chunk.startDate,
            end: chunk.endDate,
          })
          .orderBy('event.postId')
          .addOrderBy('event.createdAt')
          .addOrderBy('event.id')
          .getRawMany<FlagEvent>();

        if (events.length === 0) continue;

        const episodes = this.reconstructEpisodes(events);

        this.logger.log({
          msg: 'Syncing {count} flag episodes for {range}',
          count: episodes.length,
          range: { start: chunk.startDate, end: chunk.endDate },
        });

        await this.lifecycleService.upsertEpisodes(episodes);
      }

      await this.stampService.stamp(FlagLifecycleEntity, [manifest.id]);
    }
  }

  /**
   * Walks per-post ordered events into episodes: a `flag_created` opens one
   * (repeats while already open are the same episode), and the next
   * `flag_removed` or `deleted` closes it and attributes the handler. A close
   * with no open episode is a deletion of an unflagged post, so it is ignored.
   */
  private reconstructEpisodes(events: FlagEvent[]): FlagEpisodeData[] {
    const episodes: FlagEpisodeData[] = [];
    let open: FlagEpisodeData | null = null;
    let currentPost: number | null = null;

    for (const event of events) {
      if (event.post_id !== currentPost) {
        if (open) episodes.push(open);
        open = null;
        currentPost = event.post_id;
      }

      if (event.action === PostEventAction.flag_created) {
        open ??= {
          postId: event.post_id,
          flaggedAt: event.created_at,
          handledAt: null,
          handlerId: null,
          handling: null,
        };
      } else if (open) {
        open.handledAt = event.created_at;
        open.handlerId = event.creator_id;
        open.handling =
          event.action === PostEventAction.deleted
            ? FlagHandling.deleted
            : FlagHandling.removed;
        episodes.push(open);
        open = null;
      }
    }

    if (open) episodes.push(open);

    return episodes;
  }
}
