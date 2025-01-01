import { Logout, MonitorHeart } from '@mui/icons-material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useIsAdmin } from '../api';
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
  const { data: isAdmin } = useIsAdmin({
    query: {
      enabled: isOwnProfile,
    },
  });

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
              ...(isAdmin
                ? [
                    <NavButton
                      key="health"
                      component={Link}
                      {...{ to: '/health' }}
                      endIcon={<MonitorHeart />}
                    >
                      Health
                    </NavButton>,
                    <NavDivider />,
                  ]
                : []),
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
