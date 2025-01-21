import { OpenInNew } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { useUserHead } from '../api';
import { useChartValue } from '../utils';
import { UserAvatar } from './UserAvatar';
import { UsernameText } from './UsernameText';

export const UserCard: React.FC = () => {
  const { userId } = useChartValue();
  const { data: user } = useUserHead(userId ?? 0, {
    query: {
      enabled: !!userId,
    },
  });

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <UserAvatar user={user} shape="rounded" size={64} />
      <Stack>
        <UsernameText user={user} />
        <Typography variant="body2" color="text.secondary">
          {user?.level}
        </Typography>
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton
        component={Link}
        to={`https://e621.net/users/${user?.id}`}
        target="_blank"
        disabled={!user}
      >
        <OpenInNew />
      </IconButton>
    </Stack>
  );
};
