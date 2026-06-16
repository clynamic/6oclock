import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { DateRange, chunkDateRange } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { MoreThan, Repository } from 'typeorm';

import { FlagHandling } from './flag-lifecycle.entity';
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

@Injectable()
export class FlagLifecycleWorker {
  constructor(
    private readonly lifecycleService: FlagLifecycleService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(PostEventEntity)
    private readonly postEventRepository: Repository<PostEventEntity>,
  ) {}

  private readonly logger = new Logger(FlagLifecycleWorker.name);
  // TODO: Persist this across restarts
  private lastProcessedTime: Date | null = null;

  @JobHandler({
    id: 'flag-lifecycle/post-events',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runSync(job: Job) {
    const manifests = await this.manifestRepository.find({
      where: {
        type: ItemType.postEvents,
        ...(this.lastProcessedTime && {
          updatedAt: MoreThan(this.lastProcessedTime),
        }),
      },
    });

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

        // Pull the full flag history of every post touched in this window, not
        // just the window's events, so episodes that open or close outside the
        // chunk still reconstruct correctly.
        const events: FlagEvent[] = await this.postEventRepository.query(
          `
          SELECT pe.post_id, pe.created_at, pe.action, pe.creator_id
          FROM post_events pe
          WHERE pe.action IN ($1, $2, $3)
            AND pe.post_id IN (
              SELECT DISTINCT post_id FROM post_events
              WHERE action IN ($1, $2, $3)
                AND created_at >= $4 AND created_at < $5
            )
          ORDER BY pe.post_id, pe.created_at, pe.id
          `,
          [
            PostEventAction.flag_created,
            PostEventAction.flag_removed,
            PostEventAction.deleted,
            chunk.startDate,
            chunk.endDate,
          ],
        );

        if (events.length === 0) continue;

        const episodes = this.reconstructEpisodes(events);

        this.logger.log(
          `Syncing ${episodes.length} flag episodes for ${chunk.toE621RangeString()}`,
        );

        await this.lifecycleService.upsertEpisodes(episodes);
      }
    }

    this.lastProcessedTime = new Date();
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
