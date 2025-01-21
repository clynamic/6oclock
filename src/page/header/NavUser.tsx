import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';

import { useUserHead } from '../../api';
import { useAuth } from '../../auth';
import { NavLink } from './NavLink';

export const NavUser: React.FC = () => {
  const { payload } = useAuth();
  const { data: user } = useUserHead(payload?.userId ?? 0, {
    query: {
      enabled: payload?.userId !== undefined,
    },
  });

  if (!payload || !user) return null;

  return (
    <NavLink
      component={Link}
      href={`/users/${user.id}`}
      endIcon={
        <Avatar
          variant="circular"
          alt={`avatar of ${user?.name ?? `User #${user?.id}`}`}
          src={user?.avatar}
          sx={{
            width: 24,
            height: 24,
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          {user?.name.split('_').map((part) => part[0]) ?? '?'}
        </Avatar>
      }
      label={user?.name.replace(/_/g, ' ') ?? 'Profile'}
    />
  );
};
