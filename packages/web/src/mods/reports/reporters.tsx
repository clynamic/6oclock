import { Ticket } from "../../api";

export interface ReporterSummary {
  user: number;
  count: number;
  dates: Date[];
}

export const getTicketReporters = (
  tickets?: Ticket[]
): ReporterSummary[] | null => {
  if (tickets == null) return null;
  const lookup: Map<number, ReporterSummary> = new Map();
  for (const ticket of tickets) {
    if (!ticket.creator_id) continue;
    if (!lookup.has(ticket.creator_id)) {
      lookup.set(ticket.creator_id, {
        user: ticket.creator_id,
        count: 1,
        dates: [new Date(ticket.updated_at)],
      });
    } else {
      const summary = lookup.get(ticket.creator_id)!;
      summary.count++;
      summary.dates.push(new Date(ticket.created_at));
    }
  }
  const result = Array.from(lookup.values());
  result.sort((a, b) => b.count - a.count);
  return result;
};
