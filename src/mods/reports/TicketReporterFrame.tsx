import { Card, Box, Stack, Avatar, Skeleton, Typography } from "@mui/material";
import { Post, User } from "../../api";
import { ReporterSummary } from "./reporters";

export interface TicketReporterFrameProps {
  position: number;
  reporter: ReporterSummary;
  user?: User;
  avatar?: Post;
}

export const TicketReporterFrame: React.FC<TicketReporterFrameProps> = ({
  reporter,
  user,
  avatar,
}) => {
  return (
    <Card>
      <Box p={2}>
        <Stack direction="row" spacing={2}>
          {user ? (
            <Avatar
              variant="circular"
              alt={`avatar of ${reporter.user}`}
              src={avatar?.sample.url}
              sx={{
                width: 48,
                height: 48,
                bgcolor: "background.paper",
                color: "text.primary",
              }}
            >
              {user?.name.split("_").map((part) => part[0])}
            </Avatar>
          ) : (
            <Skeleton variant="circular" width={48} height={48} />
          )}
          <Stack sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {user ? user.name : <Skeleton width={120} />}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {reporter.count} reports
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
