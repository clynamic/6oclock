import { Button, Stack } from "@mui/material";
import { TicketLeaderboardFrame } from "./TicketLeaderboardFrame";
import { getTicketContributors, TicketContributions } from "./contributions";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Ticket } from "../../api";
import { LimitedList } from "../../common";
import { useDrain, useManyUsers, useManyPosts } from "../../utils";
import { ArrowForward } from "@mui/icons-material";

export interface TicketLeaderboardProps {
  tickets?: Ticket[];
}

export const TicketLeaderboard: React.FC<TicketLeaderboardProps> = ({
  tickets,
}) => {
  const contributions = getTicketContributors(tickets);

  const { data: users } = useDrain(
    useManyUsers(contributions?.map((c) => c.user))
  );
  const { data: avatars } = useDrain(
    useManyPosts(
      users
        ?.filter((u) => u.avatar_id != null)
        .map((u) => u.avatar_id) as number[]
    )
  );

  const mockContributions: TicketContributions[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: 5 - i,
        user: i + 1,
        count: 5 - i,
        dates: Array.from({ length: 5 - i }, (_, j) =>
          dayjs().add(j, "day").toDate()
        ),
      })),
    []
  );

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button size="small" endIcon={<ArrowForward />}>
            See All ({contributions?.length})
          </Button>
        </Stack>
      )}
    >
      {(contributions ?? mockContributions).map((contribution) => {
        const user = users?.find((user) => user.id === contribution.user);
        const avatar = avatars?.find((post) => post.id === user?.avatar_id);
        return (
          <TicketLeaderboardFrame
            key={contribution.user}
            contribution={contribution}
            user={user}
            avatar={avatar}
          />
        );
      })}
    </LimitedList>
  );
};
