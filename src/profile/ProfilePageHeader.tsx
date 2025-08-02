import { Logout, Shield, ShieldOutlined } from '@mui/icons-material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/context';
import { useSafeMode } from '../common/SafeModeContext';
import { PageHeader } from '../page/header/PageHeader';
import { NavButton } from '../page/header/NavButton';
import { NavDivider } from '../page/header/NavDivider';
import { NavSpacer } from '../page/header/NavSpacer';
import { DashboardEditHeader } from '../dashboard/DashboardEditHeader';

export interface ProfilePageHeaderProps {
  userId?: number;
}

export const ProfilePageHeader: React.FC<ProfilePageHeaderProps> = ({
  userId,
}) => {
  const { payload } = useAuth();
  const { safeMode, setSafeMode } = useSafeMode();
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
                key="safe-mode"
                onClick={() => setSafeMode(!safeMode)}
                endIcon={safeMode ? <Shield /> : <ShieldOutlined />}
                color={safeMode ? 'success' : 'inherit'}
              >
                Safe Mode
              </NavButton>,
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
