import { Stack } from '@mui/material';

import { useUserHead } from '../api';
import { useChartParamsValue } from '../utils';
import { UserAvatar } from './UserAvatar';
import { UsernameText } from './UsernameText';

export const UserCard: React.FC = () => {
  const { userId } = useChartParamsValue();
  const { data: user } = useUserHead(userId ?? 0, {
    query: {
      enabled: !!userId,
    },
  });

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <UserAvatar user={user} shape="rounded" size={64} />
      <UsernameText user={user} />
    </Stack>
  );
};
