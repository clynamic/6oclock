import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModActionAction } from 'src/api';
import { DateRange, chunkDateRange } from 'src/common';
import { Job } from 'src/job/job.constants';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { ItemType } from 'src/label/label.entity';
import { ManifestEntity } from 'src/manifest/manifest.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { MoreThan, Repository } from 'typeorm';

import { TicketEntity } from '../ticket.entity';
import { TicketLifecycleService } from './ticket-lifecycle.service';
import { TicketEvent, reconstructTicketLives } from './ticket-lifecycle.utils';

@Injectable()
export class TicketLifecycleWorker {
  constructor(
    private readonly lifecycleService: TicketLifecycleService,
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
    @InjectRepository(ModActionEntity)
    private readonly modActionRepository: Repository<ModActionEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
  ) {}

  private readonly logger = new Logger(TicketLifecycleWorker.name);
  // TODO: Persist this across restarts
  private lastProcessedTime: Date | null = null;

  @JobHandler({
    id: 'ticketLifecycle/tickets',
    queue: 'tiling',
    pattern: '*/3 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async runSync(job: Job) {
    const manifests = await this.manifestRepository.find({
      where: {
        type: ItemType.tickets,
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

        const tickets = await this.ticketRepository.find({
          where: { createdAt: chunk.find() },
          select: [
            'id',
            'createdAt',
            'creatorId',
            'claimantId',
            'handlerId',
            'status',
            'updatedAt',
          ],
        });

        if (tickets.length === 0) continue;

        const events: TicketEvent[] = await this.modActionRepository.query(
          `
          SELECT (ma."values"->>'ticket_id')::int AS ticket_id,
                 ma.created_at,
                 ma.action,
                 ma.creator_id,
                 ma."values"->>'status' AS status
          FROM mod_actions ma
          WHERE ma.action IN ($1, $2)
            AND (ma."values"->>'ticket_id')::int = ANY($3)
          ORDER BY ticket_id, ma.created_at, ma.id
          `,
          [
            ModActionAction.ticket_claim,
            ModActionAction.ticket_update,
            tickets.map((ticket) => ticket.id),
          ],
        );

        const lives = reconstructTicketLives(tickets, events);

        this.logger.log({
          msg: 'Syncing {count} ticket lives for {range}',
          count: lives.length,
          range: { start: chunk.startDate, end: chunk.endDate },
        });

        await this.lifecycleService.upsertLives(lives);
      }
    }

    this.lastProcessedTime = new Date();
  }
}
