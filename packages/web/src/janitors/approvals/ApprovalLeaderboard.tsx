import { ArrowForward } from "@mui/icons-material";
import { Button,Stack } from "@mui/material";
import dayjs from "dayjs";
import { useMemo } from "react";

import { Approval } from "../../api";
import { LimitedList } from "../../common";
import { useDrain, useManyAvatars,useManyUsers } from "../../utils";
import { ApprovalLeaderboardFrame } from "./ApprovalLeaderboardFrame";
import { getApprovalContributors } from "./approvals";

export interface ApprovalLeaderboardProps {
  approvals?: Approval[];
}

export const ApprovalLeaderboard: React.FC<ApprovalLeaderboardProps> = ({
  approvals,
}) => {
  const contributions = getApprovalContributors(approvals);

  const { data: users } = useDrain(
    useManyUsers(contributions?.map((c) => c.user))
  );
  const { data: avatars } = useDrain(useManyAvatars(users));

  const mockContributions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: i + 1,
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
          <ApprovalLeaderboardFrame
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
