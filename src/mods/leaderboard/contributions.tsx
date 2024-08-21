import { Ticket } from "../../api";

export interface ModContributions {
  user: number;
  count: number;
  dates: Date[];
}

export const getModContributors = (
  tickets?: Ticket[]
): ModContributions[] | null => {
  if (tickets == null) return null;
  const lookup: Map<number, ModContributions> = new Map();
  for (const ticket of tickets) {
    if (!ticket.claimant_id) continue;
    if (ticket.status !== "approved") continue;
    if (!lookup.has(ticket.claimant_id)) {
      lookup.set(ticket.claimant_id, {
        user: ticket.claimant_id,
        count: 1,
        dates: [new Date(ticket.updated_at)],
      });
    } else {
      const contribution = lookup.get(ticket.claimant_id)!;
      contribution.count++;
      contribution.dates.push(new Date(ticket.created_at));
    }
  }
  const result = Array.from(lookup.values());
  result.sort((a, b) => b.count - a.count);
  return result;
};
