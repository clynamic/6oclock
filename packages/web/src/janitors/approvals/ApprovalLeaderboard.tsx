import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import { useJanitorSummary } from "../../api";
import { LimitedList } from "../../common";
import { DateRange } from "../../utils";
import { ApprovalLeaderboardFrame } from "./ApprovalLeaderboardFrame";

export interface ApprovalLeaderboardProps {
  range?: DateRange;
}

export const ApprovalLeaderboard: React.FC<ApprovalLeaderboardProps> = ({
  range,
}) => {
  const { data: janitors } = useJanitorSummary(range);

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
      {janitors
        ? janitors.map((janitor, i) => {
            return (
              <ApprovalLeaderboardFrame
                key={janitor.userId}
                position={i + 1}
                summary={janitor}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <ApprovalLeaderboardFrame key={i} position={i + 1} />
          ))}
    </LimitedList>
  );
};
