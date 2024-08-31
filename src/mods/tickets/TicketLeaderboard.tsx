import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import { useModSummary } from "../../api";
import { LimitedList } from "../../common";
import { DateRange } from "../../utils";
import { TicketLeaderboardFrame } from "./TicketLeaderboardFrame";

export interface TicketLeaderboardProps {
  range?: DateRange;
}

export const TicketLeaderboard: React.FC<TicketLeaderboardProps> = ({
  range,
}) => {
  const { data: mods } = useModSummary(range);

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
      {mods
        ? mods?.map((mod, i) => {
            return (
              <TicketLeaderboardFrame
                key={mod.userId}
                position={i + 1}
                summary={mod}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <TicketLeaderboardFrame key={i} position={i + 1} />
          ))}
    </LimitedList>
  );
};
