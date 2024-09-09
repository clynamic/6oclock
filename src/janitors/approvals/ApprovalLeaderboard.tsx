import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useApproverSummary } from "../../api";
import { LimitedList } from "../../common";
import { DateRange, refetchQueryOptions } from "../../utils";
import { ApprovalLeaderboardFrame } from "./ApprovalLeaderboardFrame";

export interface ApprovalLeaderboardProps {
  range?: DateRange;
}

export const ApprovalLeaderboard: React.FC<ApprovalLeaderboardProps> = ({
  range,
}) => {
  const navigate = useNavigate();

  const { data: approvers } = useApproverSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions()
  );

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate("/janitors/approvals")}
          >
            See All
          </Button>
        </Stack>
      )}
    >
      {approvers
        ? approvers.map((approver) => {
            return (
              <ApprovalLeaderboardFrame
                key={approver.userId}
                summary={approver}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <ApprovalLeaderboardFrame key={i} />
          ))}
    </LimitedList>
  );
};
