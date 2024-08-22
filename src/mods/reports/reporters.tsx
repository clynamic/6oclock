import { Ticket } from "../../api";
import _ from "lodash";

export interface ReporterSummary {
  user: number;
  count: number;
  dates: Date[];
}

export const getTicketReporters = (
  tickets?: Ticket[]
): ReporterSummary[] | null => {
  if (_.isNil(tickets)) return null;
  return _.chain(tickets)
    .filter((ticket) => ticket.creator_id != null)
    .groupBy("creator_id")
    .map((group, creator_id) => ({
      user: Number(creator_id),
      count: group.length,
      dates: group.map((ticket) => new Date(ticket.updated_at)),
    }))
    .orderBy("count", "desc")
    .value();
};
