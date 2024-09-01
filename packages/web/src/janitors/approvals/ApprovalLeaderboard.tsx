import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import { useApproverSummary } from "../../api";
import { LimitedList } from "../../common";
import { DateRange } from "../../utils";
import { ApprovalLeaderboardFrame } from "./ApprovalLeaderboardFrame";

export interface ApprovalLeaderboardProps {
  range?: DateRange;
}

export const ApprovalLeaderboard: React.FC<ApprovalLeaderboardProps> = ({
  range,
}) => {
  const { data: approvers } = useApproverSummary(range);

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button size="small" endIcon={<ArrowForward />}>
            See All
          </Button>
        </Stack>
      )}
    >
      {approvers
        ? approvers.map((approver, i) => {
            return (
              <ApprovalLeaderboardFrame
                key={approver.userId}
                position={i + 1}
                summary={approver}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <ApprovalLeaderboardFrame key={i} position={i + 1} />
          ))}
    </LimitedList>
  );
};
