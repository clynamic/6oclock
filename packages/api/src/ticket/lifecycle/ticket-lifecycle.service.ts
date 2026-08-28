import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invalidates } from 'src/app/browser.module';
import { Repository } from 'typeorm';

import { TicketLifecycleEntity } from './ticket-lifecycle.entity';

export interface TicketLifeData {
  ticketId: number;
  createdAt: Date;
  creatorId: number;
  claimedAt: Date | null;
  claimantId: number | null;
  partialAt: Date | null;
  resolvedAt: Date | null;
  handlerId: number | null;
}

@Injectable()
export class TicketLifecycleService {
  constructor(
    @InjectRepository(TicketLifecycleEntity)
    private readonly lifecycleRepository: Repository<TicketLifecycleEntity>,
  ) {}

  @Invalidates(TicketLifecycleEntity)
  async upsertLives(data: TicketLifeData[]): Promise<void> {
    if (data.length === 0) return;

    await this.lifecycleRepository
      .createQueryBuilder()
      .insert()
      .into(TicketLifecycleEntity)
      .values(data)
      .orUpdate(
        [
          'created_at',
          'creator_id',
          'claimed_at',
          'claimant_id',
          'partial_at',
          'resolved_at',
          'handler_id',
          'updated_at',
        ],
        ['ticket_id'],
      )
      .execute();
  }

  @Invalidates(TicketLifecycleEntity)
  async wipe(): Promise<void> {
    await this.lifecycleRepository.clear();
  }
}
