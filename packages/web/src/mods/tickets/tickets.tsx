import { Ticket } from "../../api";
import _ from "lodash";

export interface TicketContributions {
  position: number;
  user: number;
  count: number;
  dates: Date[];
}

export const getTicketContributors = (
  tickets?: Ticket[]
): TicketContributions[] | null => {
  if (_.isNil(tickets)) return null;

  return _.chain(tickets)
    .filter(
      (ticket) => ticket.claimant_id != null && ticket.status === "approved"
    )
    .groupBy("claimant_id")
    .map((group, claimant_id) => ({
      user: Number(claimant_id),
      count: group.length,
      dates: group.map((ticket) => new Date(ticket.updated_at)),
    }))
    .orderBy("count", "desc")
    .map((contribution, index) => ({
      ...contribution,
      position: index + 1,
    }))
    .value();
};
