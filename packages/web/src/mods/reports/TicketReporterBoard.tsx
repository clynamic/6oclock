import { Button, Stack } from "@mui/material";
import { Ticket } from "../../api";
import { LimitedList } from "../../common";
import { getTicketReporters } from "./reporters";
import { useDrain, useManyUsers, useManyPosts } from "../../utils";
import { TicketReporterFrame } from "./TicketReporterFrame";
import { useMemo } from "react";
import dayjs from "dayjs";
import { ArrowForward } from "@mui/icons-material";

export interface TicketReporterBoardProps {
  tickets?: Ticket[];
}

export const TicketReporterBoard: React.FC<TicketReporterBoardProps> = ({
  tickets,
}) => {
  const allReporters = getTicketReporters(tickets);
  const reporters = useMemo(() => allReporters?.slice(0, 10), [allReporters]);

  const mockReporters = Array.from({ length: 5 }, (_, i) => ({
    user: i + 1,
    count: 5 - i,
    dates: Array.from({ length: 5 - i }, (_, j) =>
      dayjs().add(j, "day").toDate()
    ),
  }));

  const { data: users } = useDrain(useManyUsers(reporters?.map((r) => r.user)));
  const { data: avatars } = useDrain(
    useManyPosts(
      users
        ?.filter((u) => u.avatar_id != null)
        .map((u) => u.avatar_id) as number[]
    )
  );

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button size="small" endIcon={<ArrowForward />}>
            See All ({allReporters?.length})
          </Button>
        </Stack>
      )}
    >
      {(reporters ?? mockReporters).map((reporter, index) => {
        const user = users?.find((user) => user.id === reporter.user);
        const avatar = avatars?.find((post) => post.id === user?.avatar_id);
        return (
          <TicketReporterFrame
            key={reporter.user}
            reporter={reporter}
            position={index + 1}
            user={user}
            avatar={avatar}
          />
        );
      })}
    </LimitedList>
  );
};
