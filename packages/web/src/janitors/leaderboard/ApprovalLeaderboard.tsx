import { useMemo } from "react";
import { Approval } from "../../api";
import { useDrain, useManyUsers, useManyAvatars } from "../../utils";
import { getApprovalContributors } from "./contributions";
import { LimitedList } from "../../common";
import { ApprovalLeaderboardFrame } from "./ApprovalLeaderboardFrame";
import { ArrowForward } from "@mui/icons-material";
import { Stack, Button } from "@mui/material";
import dayjs from "dayjs";

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
