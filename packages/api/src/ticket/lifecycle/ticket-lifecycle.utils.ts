import { ModActionAction, TicketStatus } from 'src/api';

import { TicketEntity } from '../ticket.entity';
import { TicketLifeData } from './ticket-lifecycle.service';

export interface TicketEvent {
  ticket_id: number;
  created_at: Date;
  action: ModActionAction;
  status: string | null;
  creator_id: number;
}

export const reconstructTicketLives = (
  tickets: TicketEntity[],
  events: TicketEvent[],
): TicketLifeData[] => {
  const lives = new Map<number, TicketLifeData>(
    tickets.map((ticket) => [
      ticket.id,
      {
        ticketId: ticket.id,
        createdAt: ticket.createdAt,
        creatorId: ticket.creatorId,
        claimedAt: null,
        claimantId: null,
        partialAt: null,
        resolvedAt: null,
        handlerId: null,
      },
    ]),
  );

  for (const event of events) {
    const life = lives.get(event.ticket_id);
    if (!life) continue;

    if (event.action === ModActionAction.ticket_claim) {
      life.claimedAt ??= event.created_at;
      life.claimantId ??= event.creator_id;
    } else if (event.status === TicketStatus.approved) {
      life.resolvedAt = event.created_at;
      life.handlerId = event.creator_id;
    } else if (event.status === TicketStatus.partial) {
      life.partialAt ??= event.created_at;
      life.resolvedAt = null;
      life.handlerId = null;
    }
  }

  // Updates logged before e621ng 78b779bdc carry no status, so the ticket
  // itself is the only record of how it ended.
  for (const ticket of tickets) {
    const life = lives.get(ticket.id)!;
    life.claimantId ??= ticket.claimantId;
    if (!life.resolvedAt && ticket.status === TicketStatus.approved) {
      life.resolvedAt = ticket.updatedAt;
      life.handlerId = ticket.handlerId;
    }
  }

  return [...lives.values()];
};
