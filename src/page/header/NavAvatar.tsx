import { Avatar, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { useCurrentUserHead } from '../../auth/user';

export interface NavAvatarProps {
  size?: number;
}

export const NavAvatar: React.FC<NavAvatarProps> = ({ size = 58 }) => {
  const { data: user } = useCurrentUserHead();

  return (
    <Button
      component={NavLink}
      to={user?.id ? `/users/${user.id}` : `/login`}
      sx={{ padding: 0, minWidth: size }}
    >
      <Avatar
        variant="rounded"
        alt={`avatar of ${user?.name ?? `User #${user?.id}`}`}
        src={user?.avatar}
        sx={{
          width: size,
          height: size,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        {user?.name.split('_').map((part) => part[0]) ?? '?'}
      </Avatar>
    </Button>
  );
};
