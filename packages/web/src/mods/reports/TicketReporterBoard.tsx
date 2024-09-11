import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useReporterSummary } from "../../api";
import { LimitedList, NoDataHint } from "../../common";
import { DateRange, refetchQueryOptions } from "../../utils";
import { TicketReporterFrame } from "./TicketReporterFrame";

export interface TicketReporterBoardProps {
  range?: DateRange;
}

export const TicketReporterBoard: React.FC<TicketReporterBoardProps> = ({
  range,
}) => {
  const navigate = useNavigate();

  const { data: reporters } = useReporterSummary(
    {
      ...range,
      limit: 10,
    },
    refetchQueryOptions()
  );

  if (reporters?.length === 0) return <NoDataHint />;

  return (
    <LimitedList
      indicator={() => (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate("/mods/reports")}
          >
            See All
          </Button>
        </Stack>
      )}
    >
      {reporters
        ? reporters.map((reporter) => {
            return (
              <TicketReporterFrame key={reporter.userId} summary={reporter} />
            );
          })
        : Array.from({ length: 5 }).map((_, index) => (
            <TicketReporterFrame key={index} />
          ))}
    </LimitedList>
  );
};
