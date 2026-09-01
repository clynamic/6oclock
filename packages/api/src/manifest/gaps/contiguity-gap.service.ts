import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invalidates } from 'src/app/browser.module';
import { AppealEntity } from 'src/appeal/appeal.entity';
import { BulkUpdateRequestEntity } from 'src/bulk-update-request/bulk-update-request.entity';
import { WithId } from 'src/common';
import { FeedbackEntity } from 'src/feedback/feedback.entity';
import { FlagEntity } from 'src/flag/flag.entity';
import { ItemType } from 'src/label/label.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { PermitEntity } from 'src/permit/permit.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TagAliasEntity } from 'src/tag-alias/tag-alias.entity';
import { TagImplicationEntity } from 'src/tag-implication/tag-implication.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';
import { Between, Repository } from 'typeorm';

import { ManifestEntity } from '../manifest.entity';
import { ContiguityGapEntity } from './contiguity-gap.entity';

const INSERT_CHUNK = 5000;

export interface GapRange {
  type: ItemType;
  manifestId: number;
  lowerId: number;
  upperId: number;
}

@Injectable()
export class ContiguityGapService {
  constructor(
    @InjectRepository(ContiguityGapEntity)
    private readonly gapRepository: Repository<ContiguityGapEntity>,
    @InjectRepository(AppealEntity)
    private readonly appealRepository: Repository<AppealEntity>,
    @InjectRepository(BulkUpdateRequestEntity)
    private readonly bulkUpdateRequestRepository: Repository<BulkUpdateRequestEntity>,
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(FlagEntity)
    private readonly flagRepository: Repository<FlagEntity>,
    @InjectRepository(ModActionEntity)
    private readonly modActionRepository: Repository<ModActionEntity>,
    @InjectRepository(PermitEntity)
    private readonly permitRepository: Repository<PermitEntity>,
    @InjectRepository(PostEventEntity)
    private readonly postEventRepository: Repository<PostEventEntity>,
    @InjectRepository(PostReplacementEntity)
    private readonly postReplacementRepository: Repository<PostReplacementEntity>,
    @InjectRepository(PostVersionEntity)
    private readonly postVersionRepository: Repository<PostVersionEntity>,
    @InjectRepository(TagAliasEntity)
    private readonly tagAliasRepository: Repository<TagAliasEntity>,
    @InjectRepository(TagImplicationEntity)
    private readonly tagImplicationRepository: Repository<TagImplicationEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
  ) {}

  private itemRepositories: Partial<Record<ItemType, Repository<WithId>>> = {
    [ItemType.appeals]: this.appealRepository,
    [ItemType.bulkUpdateRequests]: this.bulkUpdateRequestRepository,
    [ItemType.feedbacks]: this.feedbackRepository,
    [ItemType.flags]: this.flagRepository,
    [ItemType.modActions]: this.modActionRepository,
    [ItemType.permits]: this.permitRepository,
    [ItemType.postEvents]: this.postEventRepository,
    [ItemType.postReplacements]: this.postReplacementRepository,
    [ItemType.postVersions]: this.postVersionRepository,
    [ItemType.tagAliases]: this.tagAliasRepository,
    [ItemType.tagImplications]: this.tagImplicationRepository,
    [ItemType.tickets]: this.ticketRepository,
  };

  rangesOf(
    manifests: ManifestEntity[],
    scanning: ManifestEntity[],
  ): GapRange[] {
    const wanted = new Set(scanning.map((manifest) => manifest.id));
    const ordered = manifests
      .filter(
        (manifest) => manifest.lowerId !== null && manifest.upperId !== null,
      )
      .sort((a, b) =>
        a.type === b.type
          ? a.lowerId! - b.lowerId!
          : a.type.localeCompare(b.type),
      );

    const ranges: GapRange[] = [];
    let previous: ManifestEntity | undefined;

    for (const manifest of ordered) {
      const contiguous = previous?.type === manifest.type;
      const lowerId = contiguous ? previous!.upperId! : manifest.lowerId!;
      previous = manifest;

      if (!wanted.has(manifest.id)) continue;
      if (!this.itemRepositories[manifest.type]) continue;

      ranges.push({
        type: manifest.type,
        manifestId: manifest.id,
        lowerId,
        upperId: manifest.upperId!,
      });
    }

    return ranges;
  }

  private dateColumn(repository: Repository<WithId>): string {
    const columns = repository.metadata.columns;
    const dated =
      columns.find((column) => column.propertyName === 'createdAt') ??
      columns.find((column) => column.propertyName === 'updatedAt');

    return dated!.databaseName;
  }

  async scan(range: GapRange): Promise<ContiguityGapEntity[]> {
    const repository = this.itemRepositories[range.type];
    if (!repository) return [];

    const dated = this.dateColumn(repository);

    const rows: {
      lower: number;
      upper: number;
      after: Date;
      before: Date;
      // eslint-disable-next-line no-restricted-syntax -- window function
    }[] = await repository.query(
      `
      SELECT id + 1 AS lower, next_id - 1 AS upper, dated AS after, next_dated AS before
      FROM (
        SELECT
          id,
          ${dated} AS dated,
          lead(id) OVER (ORDER BY id) AS next_id,
          lead(${dated}) OVER (ORDER BY id) AS next_dated
        FROM ${repository.metadata.tableName}
        WHERE id BETWEEN $1 AND $2
      ) s
      WHERE next_id > id + 1
      `,
      [range.lowerId, range.upperId],
    );

    return rows.map(
      (row) =>
        new ContiguityGapEntity({
          type: range.type,
          lowerId: row.lower,
          upperId: row.upper,
          startDate: row.after,
          endDate: row.before,
        }),
    );
  }

  @Invalidates(ContiguityGapEntity)
  async replace(range: GapRange, gaps: ContiguityGapEntity[]): Promise<void> {
    await this.gapRepository.manager.transaction(async (manager) => {
      await manager.delete(ContiguityGapEntity, {
        type: range.type,
        lowerId: Between(range.lowerId, range.upperId),
      });

      for (let i = 0; i < gaps.length; i += INSERT_CHUNK) {
        await manager.insert(
          ContiguityGapEntity,
          gaps.slice(i, i + INSERT_CHUNK),
        );
      }
    });
  }
}
