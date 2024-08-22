import { Avatar, Box, Card, Skeleton, Stack, Typography } from "@mui/material";

import { Post, User } from "../../api";
import { UploaderSummary } from "./uploaders";

export interface UploaderFrameProps {
  position: number;
  uploader: UploaderSummary;
  user?: User;
  avatar?: Post;
}

export const UploaderFrame: React.FC<UploaderFrameProps> = ({
  uploader,
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
              alt={`avatar of ${uploader.user}`}
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
              {uploader.count} uploads
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
