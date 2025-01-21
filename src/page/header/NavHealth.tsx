import { useIsAdmin } from '../../api';
import { NavLink } from './NavLink';
import { usePageHeaderContext } from './PageHeaderContext';

// TODO: this is super janky. Nav entries should have dynamic visibility
export const NavHealth: React.FC = () => {
  const { data: isAdmin } = useIsAdmin();
  const { currentLink } = usePageHeaderContext();

  return isAdmin ? (
    <NavLink
      href="/health"
      label={'Health'}
      selected={currentLink?.href === '/health'}
    />
  ) : (
    <> </>
  );
};
