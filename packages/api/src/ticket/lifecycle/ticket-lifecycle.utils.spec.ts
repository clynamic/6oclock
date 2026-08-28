import { ModActionAction, TicketQtype, TicketStatus } from 'src/api';

import { TicketEntity } from '../ticket.entity';
import { TicketEvent, reconstructTicketLives } from './ticket-lifecycle.utils';

const at = (iso: string): Date => new Date(iso);

const ticket = (partial: Partial<TicketEntity> = {}): TicketEntity =>
  new TicketEntity({
    id: 1,
    creatorId: 100,
    claimantId: null,
    handlerId: null as unknown as number,
    accusedId: null,
    dispId: null,
    qtype: TicketQtype.post,
    reason: 'reason',
    reportReason: null,
    response: '',
    status: TicketStatus.pending,
    createdAt: at('2024-01-01T00:00:00Z'),
    updatedAt: at('2024-01-01T00:00:00Z'),
    ...partial,
  });

const claim = (partial: Partial<TicketEvent> = {}): TicketEvent => ({
  ticket_id: 1,
  created_at: at('2024-01-02T00:00:00Z'),
  action: ModActionAction.ticket_claim,
  status: null,
  creator_id: 200,
  ...partial,
});

const update = (partial: Partial<TicketEvent> = {}): TicketEvent => ({
  ticket_id: 1,
  created_at: at('2024-01-03T00:00:00Z'),
  action: ModActionAction.ticket_update,
  status: TicketStatus.approved,
  creator_id: 300,
  ...partial,
});

describe('reconstructTicketLives', () => {
  it('returns one life per ticket, including tickets with no events', () => {
    const lives = reconstructTicketLives(
      [ticket({ id: 1 }), ticket({ id: 2 })],
      [],
    );

    expect(lives.map((life) => life.ticketId)).toEqual([1, 2]);
    expect(lives[0]).toEqual({
      ticketId: 1,
      createdAt: at('2024-01-01T00:00:00Z'),
      creatorId: 100,
      claimedAt: null,
      claimantId: null,
      partialAt: null,
      resolvedAt: null,
      handlerId: null,
    });
  });

  it('ignores events for a ticket outside the batch', () => {
    const [life] = reconstructTicketLives(
      [ticket({ id: 1 })],
      [claim({ ticket_id: 2 }), update({ ticket_id: 2 })],
    );

    expect(life).toMatchObject({
      claimedAt: null,
      claimantId: null,
      resolvedAt: null,
      handlerId: null,
    });
  });

  it('takes the first claim and keeps it against later ones', () => {
    const [life] = reconstructTicketLives(
      [ticket()],
      [
        claim({ created_at: at('2024-01-02T00:00:00Z'), creator_id: 200 }),
        claim({ created_at: at('2024-01-04T00:00:00Z'), creator_id: 201 }),
      ],
    );

    expect(life).toMatchObject({
      claimedAt: at('2024-01-02T00:00:00Z'),
      claimantId: 200,
    });
  });

  it('credits a logged resolution to the moderator who logged it', () => {
    const [life] = reconstructTicketLives(
      [ticket({ status: TicketStatus.approved, handlerId: 999 })],
      [update({ created_at: at('2024-01-03T00:00:00Z'), creator_id: 300 })],
    );

    expect(life).toMatchObject({
      resolvedAt: at('2024-01-03T00:00:00Z'),
      handlerId: 300,
    });
  });

  it('lets the last logged resolution overwrite an earlier one', () => {
    const [life] = reconstructTicketLives(
      [ticket({ status: TicketStatus.approved })],
      [
        update({ created_at: at('2024-01-03T00:00:00Z'), creator_id: 300 }),
        update({ created_at: at('2024-01-05T00:00:00Z'), creator_id: 301 }),
      ],
    );

    expect(life).toMatchObject({
      resolvedAt: at('2024-01-05T00:00:00Z'),
      handlerId: 301,
    });
  });

  it('clears the resolution when a ticket is reopened as partial', () => {
    const [life] = reconstructTicketLives(
      [ticket({ status: TicketStatus.partial })],
      [
        update({ created_at: at('2024-01-03T00:00:00Z'), creator_id: 300 }),
        update({
          created_at: at('2024-01-04T00:00:00Z'),
          status: TicketStatus.partial,
          creator_id: 301,
        }),
      ],
    );

    expect(life).toMatchObject({
      partialAt: at('2024-01-04T00:00:00Z'),
      resolvedAt: null,
      handlerId: null,
    });
  });

  it('keeps the first partial when a ticket goes partial twice', () => {
    const [life] = reconstructTicketLives(
      [ticket({ status: TicketStatus.partial })],
      [
        update({
          created_at: at('2024-01-03T00:00:00Z'),
          status: TicketStatus.partial,
        }),
        update({
          created_at: at('2024-01-06T00:00:00Z'),
          status: TicketStatus.partial,
        }),
      ],
    );

    expect(life).toMatchObject({ partialAt: at('2024-01-03T00:00:00Z') });
  });

  it('resolves a ticket that went partial before it was approved', () => {
    const [life] = reconstructTicketLives(
      [ticket({ status: TicketStatus.approved })],
      [
        update({
          created_at: at('2024-01-03T00:00:00Z'),
          status: TicketStatus.partial,
          creator_id: 300,
        }),
        update({ created_at: at('2024-01-04T00:00:00Z'), creator_id: 301 }),
      ],
    );

    expect(life).toMatchObject({
      partialAt: at('2024-01-03T00:00:00Z'),
      resolvedAt: at('2024-01-04T00:00:00Z'),
      handlerId: 301,
    });
  });

  it('falls back to the ticket row when the log recorded no status', () => {
    const [life] = reconstructTicketLives(
      [
        ticket({
          status: TicketStatus.approved,
          handlerId: 999,
          updatedAt: at('2024-01-07T00:00:00Z'),
        }),
      ],
      [update({ status: null })],
    );

    expect(life).toMatchObject({
      resolvedAt: at('2024-01-07T00:00:00Z'),
      handlerId: 999,
    });
  });

  it('leaves a pending ticket unresolved when the log recorded no status', () => {
    const [life] = reconstructTicketLives(
      [ticket({ status: TicketStatus.pending, handlerId: 999 })],
      [update({ status: null })],
    );

    expect(life).toMatchObject({ resolvedAt: null, handlerId: null });
  });

  it('leaves the fallback out when the log already resolved the ticket', () => {
    const [life] = reconstructTicketLives(
      [
        ticket({
          status: TicketStatus.approved,
          handlerId: 999,
          updatedAt: at('2024-01-07T00:00:00Z'),
        }),
      ],
      [update({ created_at: at('2024-01-03T00:00:00Z'), creator_id: 300 })],
    );

    expect(life).toMatchObject({
      resolvedAt: at('2024-01-03T00:00:00Z'),
      handlerId: 300,
    });
  });

  it('does not restore a resolution the log cleared, even for an approved row', () => {
    const [life] = reconstructTicketLives(
      [
        ticket({
          status: TicketStatus.approved,
          handlerId: 999,
          updatedAt: at('2024-01-07T00:00:00Z'),
        }),
      ],
      [
        update({ created_at: at('2024-01-03T00:00:00Z'), creator_id: 300 }),
        update({
          created_at: at('2024-01-04T00:00:00Z'),
          status: TicketStatus.partial,
          creator_id: 301,
        }),
      ],
    );

    expect(life).toMatchObject({
      resolvedAt: at('2024-01-07T00:00:00Z'),
      handlerId: 999,
    });
  });

  it('takes the claimant from the ticket row without inventing a claim time', () => {
    const [life] = reconstructTicketLives([ticket({ claimantId: 555 })], []);

    expect(life).toMatchObject({ claimedAt: null, claimantId: 555 });
  });

  it('prefers the logged claimant over the one on the ticket row', () => {
    const [life] = reconstructTicketLives(
      [ticket({ claimantId: 555 })],
      [claim({ creator_id: 200 })],
    );

    expect(life).toMatchObject({ claimantId: 200 });
  });

  it('ignores an update that carries a status the ticket never reaches', () => {
    const [life] = reconstructTicketLives(
      [ticket()],
      [update({ status: TicketStatus.pending })],
    );

    expect(life).toMatchObject({
      partialAt: null,
      resolvedAt: null,
      handlerId: null,
    });
  });
});
