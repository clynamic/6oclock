import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppealEntity } from 'src/appeal/appeal.entity';
import { BulkUpdateRequestEntity } from 'src/bulk-update-request/bulk-update-request.entity';
import { FeedbackEntity } from 'src/feedback/feedback.entity';
import { FlagEntity } from 'src/flag/flag.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { PermitEntity } from 'src/permit/permit.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TagAliasEntity } from 'src/tag-alias/tag-alias.entity';
import { TagImplicationEntity } from 'src/tag-implication/tag-implication.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';

import { ManifestEntity } from '../manifest.entity';
import { ContiguityGapEntity } from './contiguity-gap.entity';
import { ContiguityGapService } from './contiguity-gap.service';
import { ContiguityGapWorker } from './contiguity-gap.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContiguityGapEntity,
      ManifestEntity,
      AppealEntity,
      BulkUpdateRequestEntity,
      FeedbackEntity,
      FlagEntity,
      ModActionEntity,
      PermitEntity,
      PostEventEntity,
      PostReplacementEntity,
      PostVersionEntity,
      TagAliasEntity,
      TagImplicationEntity,
      TicketEntity,
    ]),
  ],
  providers: [ContiguityGapService, ContiguityGapWorker],
  exports: [ContiguityGapService],
})
export class ContiguityGapModule {}
