import { keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { Ticket, useUsers, usePosts, Post, User } from "../api";
import { TicketContribution } from "./ContributionFrame";

export interface TicketContributors {
  contributions: TicketContribution[];
  users?: User[] | null;
  avatars?: Post[] | null;
}

export const useTicketContributors = (tickets?: Ticket[]) => {
  const contributions: TicketContribution[] | null = useMemo(() => {
    if (tickets == null) return null;
    const lookup: Map<number, TicketContribution> = new Map();
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
  }, [tickets]);

  const userIds = useMemo(
    () =>
      Array.from(
        new Set(contributions?.map((contribution) => contribution.user))
      ),
    [contributions]
  );

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers(
    // TODO: this has a limit of 100 users
    { "search[id]": userIds.join(",") },
    {
      query: {
        enabled: contributions != null && contributions.length > 0,
        placeholderData: keepPreviousData,
      },
    }
  );

  const avatarIds = useMemo(
    () => Array.from(new Set(users?.map((user) => user.avatar_id))),
    [users]
  );

  const {
    data: avatars,
    isLoading: avatarsLoading,
    isError: avatarsError,
  } = usePosts(
    // TODO: this has a limit of 40 posts
    { tags: `id:${avatarIds.join(",")}` },
    {
      query: {
        enabled: users != null && users.length > 0,
        placeholderData: keepPreviousData,
      },
    }
  );

  const isLoading = useMemo(
    () => usersLoading || avatarsLoading,
    [usersLoading, avatarsLoading]
  );

  const isError = useMemo(
    () => usersError || avatarsError,
    [usersError, avatarsError]
  );

  const data: TicketContributors | undefined = useMemo(
    () => (contributions ? { contributions, users, avatars } : undefined),
    [contributions, users, avatars]
  );

  return {
    data,
    isLoading,
    isError,
  };
};
