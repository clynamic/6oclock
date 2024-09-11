import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useTicketerSummary } from "../../api";
import { LimitedList, NoDataHint } from "../../common";
import { DateRange, refetchQueryOptions } from "../../utils";
import { TicketLeaderboardFrame } from "./TicketLeaderboardFrame";

export interface TicketLeaderboardProps {
  range?: DateRange;
}

export const TicketLeaderboard: React.FC<TicketLeaderboardProps> = ({
  range,
}) => {
  const navigate = useNavigate();

  const { data: ticketers } = useTicketerSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions()
  );

  if (ticketers?.length === 0) return <NoDataHint />;

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate("/mods/tickets")}
          >
            See All
          </Button>
        </Stack>
      )}
    >
      {ticketers
        ? ticketers?.map((ticketer) => {
            return (
              <TicketLeaderboardFrame
                key={ticketer.userId}
                summary={ticketer}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, i) => (
            <TicketLeaderboardFrame key={i} />
          ))}
    </LimitedList>
  );
};
