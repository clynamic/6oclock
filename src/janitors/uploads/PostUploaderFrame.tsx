import { Card, Skeleton, Stack, Typography } from '@mui/material';

import { PostUploaderSummary } from '../../api';
import { UserAvatar, UsernameText } from '../../common';

export interface PostUploaderFrame {
  summary?: PostUploaderSummary;
}

export const PostUploaderFrame: React.FC<PostUploaderFrame> = ({ summary }) => {
  return (
    <Card sx={{ width: '100%' }}>
      <Stack
        direction="row"
        p={2}
        spacing={2}
        sx={{
          width: '100%',
        }}
      >
        <UserAvatar
          user={summary ? { id: summary.userId, ...summary.head } : undefined}
        />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <UsernameText user={summary} />
          <Typography variant="body2" color="text.secondary">
            {summary ? `${summary.total} posts` : <Skeleton width={50} />}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
