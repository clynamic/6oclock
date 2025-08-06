import {
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { PostUploaderSummary } from '../../api';
import { UserAvatar } from '../../common/UserAvatar';
import { UsernameText } from '../../common/UsernameText';
import { formatNumber } from '../../utils/numbers';

export interface PostUploaderFrame {
  summary?: PostUploaderSummary;
}

export const PostUploaderFrame: React.FC<PostUploaderFrame> = ({ summary }) => {
  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea
        component={Link}
        to={`/users/${summary?.userId ?? ''}`}
        disabled={!summary}
      >
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
              {summary ? (
                `${formatNumber(summary.total)} posts`
              ) : (
                <Skeleton width={50} />
              )}
            </Typography>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
};
