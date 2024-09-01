import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import { useTicketerSummary } from "../../api";
import { LimitedList } from "../../common";
import { DateRange } from "../../utils";
import { TicketLeaderboardFrame } from "./TicketLeaderboardFrame";

export interface TicketLeaderboardProps {
  range?: DateRange;
}

export const TicketLeaderboard: React.FC<TicketLeaderboardProps> = ({
  range,
}) => {
  const { data: ticketers } = useTicketerSummary(range);

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
      {ticketers
        ? ticketers?.map((ticketer, i) => {
            return (
              <TicketLeaderboardFrame
                key={ticketer.userId}
                position={i + 1}
                summary={ticketer}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <TicketLeaderboardFrame key={i} position={i + 1} />
          ))}
    </LimitedList>
  );
};
