import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEventAction } from 'src/api';
import { DateRange, chunkDateRange, getTilingRanges } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ManifestStampService } from 'src/manifest/stamps/manifest-stamp.service';
import { PermitEntity } from 'src/permit/permit.entity';
import { PermitTilesService } from 'src/permit/tiles/permit-tiles.service';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { In, Repository } from 'typeorm';

import { PostReviewEpisodeEntity } from './post-review.entity';
import { PostReviewService } from './post-review.service';
import {
  PostReviewEvent,
  reconstructReviewEpisodes,
} from './post-review.utils';

const REVIEW_ACTIONS = [
  PostEventAction.approved,
  PostEventAction.unapproved,
  PostEventAction.deleted,
];

@Injectable()
export class PostReviewWorker {
  constructor(
    private readonly reviewService: PostReviewService,
    private readonly stampService: ManifestStampService,
    private readonly permitTilesService: PermitTilesService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(PostEventEntity)
    private readonly postEventRepository: Repository<PostEventEntity>,
    @InjectRepository(PostVersionEntity)
    private readonly postVersionRepository: Repository<PostVersionEntity>,
    @InjectRepository(PermitEntity)
    private readonly permitRepository: Repository<PermitEntity>,
  ) {}

  private readonly logger = new Logger(PostReviewWorker.name);

  @JobHandler({
    id: 'postReview/episodes',
    description:
      'Rebuilds post review episodes from uploads, post events and permits.',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runSync(job: Job) {
    const types = [ItemType.postEvents, ItemType.postVersions];

    const manifests = await this.manifestRepository.find({
      where: types.map((type) => ({ type })),
    });

    const pending = await this.pendingManifests(manifests);

    if (pending.length === 0) return;

    const ranges = getTilingRanges(
      manifests.map((manifest) => ({
        dateRange: new DateRange({
          startDate: manifest.startDate,
          endDate: manifest.endDate,
        }),
        updatedAt: manifest.updatedAt,
        type: manifest.type,
      })),
      types,
    ).filter((range) =>
      pending.some(
        (manifest) =>
          manifest.startDate < range.dateRange.endDate &&
          manifest.endDate > range.dateRange.startDate,
      ),
    );

    if (ranges.length === 0) return;

    for (const { dateRange } of ranges) {
      await ensureActive(job);

      for (const chunk of chunkDateRange(dateRange, 30)) {
        await ensureActive(job);

        const postIds = [
          ...new Set([
            ...(await this.uploadedPostIds(chunk)),
            ...(await this.touchedPostIds(chunk)),
          ]),
        ];

        if (postIds.length === 0) continue;

        const episodes = reconstructReviewEpisodes(
          await this.uploadsOf(postIds),
          await this.eventsOf(postIds),
          await this.permittedOf(postIds),
        );

        this.logger.log({
          msg: 'Syncing {count} review episodes for {range}',
          count: episodes.length,
          range: { start: chunk.startDate, end: chunk.endDate },
        });

        await this.reviewService.syncEpisodes(postIds, episodes);
      }
    }

    await this.stampService.stamp(
      PostReviewEpisodeEntity,
      pending.map((manifest) => manifest.id),
    );
  }

  private async pendingManifests(
    manifests: ManifestEntity[],
  ): Promise<ManifestEntity[]> {
    if (manifests.length === 0) return [];

    const stamped = await this.stampService.stampedAt(PostReviewEpisodeEntity);
    const permits = await this.permitTilesService.updatedAt(manifests);

    return manifests.filter((manifest) => {
      const at = stamped.get(manifest.id);
      if (!at) return true;

      const permit = permits.get(manifest.id);

      return manifest.updatedAt > at || (!!permit && permit > at);
    });
  }

  private async uploadedPostIds(range: DateRange): Promise<number[]> {
    const uploads = await this.postVersionRepository.find({
      where: { version: 1, updatedAt: range.find() },
      select: ['postId'],
    });

    return uploads.map((upload) => upload.postId);
  }

  private async touchedPostIds(range: DateRange): Promise<number[]> {
    const events = await this.postEventRepository.find({
      where: { action: In(REVIEW_ACTIONS), createdAt: range.find() },
      select: ['postId'],
    });

    return [...new Set(events.map((event) => event.postId))];
  }

  private async uploadsOf(postIds: number[]) {
    const uploads = await this.postVersionRepository.find({
      where: { version: 1, postId: In(postIds) },
      select: ['postId', 'updatedAt'],
    });

    return uploads.map((upload) => ({
      postId: upload.postId,
      uploadedAt: upload.updatedAt,
    }));
  }

  private async eventsOf(postIds: number[]): Promise<PostReviewEvent[]> {
    return this.postEventRepository.query(
      `
      SELECT pe.post_id, pe.created_at, pe.action
      FROM post_events pe
      WHERE pe.action = ANY($1) AND pe.post_id = ANY($2)
      ORDER BY pe.post_id, pe.created_at, pe.id
      `,
      [REVIEW_ACTIONS, postIds],
    );
  }

  private async permittedOf(postIds: number[]): Promise<Set<number>> {
    const permits = await this.permitRepository.find({
      where: { id: In(postIds) },
      select: ['id'],
    });

    return new Set(permits.map((permit) => permit.id));
  }
}
