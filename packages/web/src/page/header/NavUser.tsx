import { useCurrentUserHead } from '../../auth/user';
import { NavItem } from './NavItem';

export const NavUser: React.FC = () => {
  const { data: user } = useCurrentUserHead();

  return (
    <NavItem
      href={user?.id ? `/users/${user.id}` : `/login`}
      label={user?.name.replace(/_/g, ' ') ?? 'Login'}
    />
  );
};
