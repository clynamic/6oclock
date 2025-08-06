import { useMemo } from 'react';

import { Settings } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/context';
import { DashboardEditHeader } from '../dashboard/DashboardEditHeader';
import { NavButton } from '../page/header/NavButton';
import { NavDivider } from '../page/header/NavDivider';
import { NavSpacer } from '../page/header/NavSpacer';
import { PageHeader } from '../page/header/PageHeader';

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
                key="settings"
                component={Link}
                {...{ to: '/settings' }}
                endIcon={<Settings />}
              >
                Settings
              </NavButton>,
            ]
          : []),
      ]}
    />
  );
};
