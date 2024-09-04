import { Avatar, Card, Skeleton, Stack, Typography } from "@mui/material";

import { ReporterSummary } from "../../api";

export interface TicketReporterFrameProps {
  position: number;
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
        {summary ? (
          <Avatar
            variant="circular"
            alt={`avatar of ${summary.head?.name ?? `User #${summary.userId}`}`}
            src={summary.head?.avatar}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "background.paper",
              color: "text.primary",
            }}
          >
            {summary.head?.name.split("_").map((part) => part[0]) ?? "?"}
          </Avatar>
        ) : (
          <Skeleton variant="circular" width={48} height={48} />
        )}
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            noWrap
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
            overflow={"hidden"}
          >
            {summary ? (
              (summary.head?.name ?? `User #${summary.userId}`)
            ) : (
              <Skeleton width={120} />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {summary ? `${summary.total} reports` : <Skeleton width={50} />}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
