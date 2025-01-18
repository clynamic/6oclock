import { Logout } from '@mui/icons-material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth';
import { DashboardEditHeader } from '../dashboard';
import { NavButton, NavDivider, NavSpacer, PageHeader } from '../page';

export interface ProfilePageHeaderProps {
  userId?: number;
}

export const ProfilePageHeader: React.FC<ProfilePageHeaderProps> = ({
  userId,
}) => {
  const { payload } = useAuth();
  const isOwnProfile = useMemo(() => {
    return payload?.userId === userId;
  }, [payload, userId]);

  return (
    <PageHeader
      actions={[
        // if in debug mode, show Edit Header
        (import.meta.env.MODE === 'development' && [
          <DashboardEditHeader key="edit-dashboard" />,
          <NavDivider key="edit-dashboard-divider" />,
        ]) || [<NavSpacer />],
        ...(isOwnProfile
          ? [
              <NavButton
                key="logout"
                component={Link}
                {...{ to: '/logout' }}
                endIcon={<Logout />}
              >
                Log out
              </NavButton>,
            ]
          : []),
      ]}
    />
  );
};
