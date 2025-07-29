import { Avatar } from '@mui/material';

import { useCurrentUserHead } from '../../auth';
import { NavLink } from './NavLink';

export const NavUser: React.FC = () => {
  const { data: user } = useCurrentUserHead();

  if (!user) return null;

  return (
    <NavLink
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
