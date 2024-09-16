import { Card, Skeleton, Stack, Typography } from "@mui/material";

import { ReporterSummary } from "../../api";
import { UserAvatar, UsernameText } from "../../common";

export interface TicketReporterFrameProps {
  summary?: ReporterSummary;
}

export const TicketReporterFrame: React.FC<TicketReporterFrameProps> = ({
  summary,
}) => {
  return (
    <Card sx={{ width: "100%" }}>
      <Stack
        direction="row"
        p={2}
        spacing={2}
        sx={{
          width: "100%",
        }}
      >
        <UserAvatar
          user={summary ? { id: summary.userId, ...summary.head } : undefined}
        />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <UsernameText user={summary} />
          <Typography variant="body2" color="text.secondary">
            {summary ? `${summary.total} reports` : <Skeleton width={50} />}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
