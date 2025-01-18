import { useIsAdmin } from '../../api';
import { NavLink } from './NavLink';

export const NavHealth: React.FC = () => {
  const { data: isAdmin } = useIsAdmin();

  return isAdmin ? <NavLink href="/health" label={'Health'} /> : <> </>;
};
