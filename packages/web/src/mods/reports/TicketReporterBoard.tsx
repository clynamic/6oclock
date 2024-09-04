import { ArrowForward } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import { useReporterSummary } from "../../api";
import { LimitedList } from "../../common";
import { DateRange, refetchQueryOptions } from "../../utils";
import { TicketReporterFrame } from "./TicketReporterFrame";

export interface TicketReporterBoardProps {
  range?: DateRange;
}

export const TicketReporterBoard: React.FC<TicketReporterBoardProps> = ({
  range,
}) => {
  const { data: reporters } = useReporterSummary(range, refetchQueryOptions());

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
      {reporters
        ? reporters.map((reporter, index) => {
            return (
              <TicketReporterFrame
                key={reporter.userId}
                position={index + 1}
                summary={reporter}
              />
            );
          })
        : Array.from({ length: 5 }).map((_, index) => (
            <TicketReporterFrame key={index} position={index + 1} />
          ))}
    </LimitedList>
  );
};
