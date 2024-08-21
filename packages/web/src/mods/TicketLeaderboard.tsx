import { Ticket } from "../api";
import { Button } from "@mui/material";
import { ContributionFrame } from "./ContributionFrame";
import { TicketContributors, useTicketContributors } from "./contributions";
import dayjs from "dayjs";
import { useMemo } from "react";
import { LimitedList } from "../common";

export interface TicketLeaderboardProps {
  tickets?: Ticket[];
}

export const TicketLeaderboard: React.FC<TicketLeaderboardProps> = ({
  tickets,
}) => {
  const { data } = useTicketContributors(tickets);

  const fakeData: TicketContributors = useMemo(
    () => ({
      contributions: Array.from({ length: 5 }, (_, i) => ({
        user: i + 1,
        count: 5 - i,
        dates: Array.from({ length: 5 - i }, (_, j) =>
          dayjs().add(j, "day").toDate()
        ),
      })),
    }),
    []
  );

  return (
    <LimitedList
      indicator={() => (
        <Button sx={{ alignSelf: "flex-end" }} size="small">
          See All ({data?.contributions.length})
        </Button>
      )}
    >
      {(data ?? fakeData).contributions.map((contribution, index) => {
        const user = data?.users?.find((user) => user.id === contribution.user);
        const avatar = data?.avatars?.find(
          (post) => post.id === user?.avatar_id
        );
        return (
          <ContributionFrame
            key={contribution.user}
            contribution={contribution}
            position={index + 1}
            user={user}
            avatar={avatar}
          />
        );
      })}
    </LimitedList>
  );
};
