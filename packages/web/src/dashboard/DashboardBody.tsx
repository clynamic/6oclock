import { HourglassEmpty } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

import { QueryHint } from '../common';
import { LoadingHint } from '../common/LoadingHint';
import { DashboardCard } from './DashboardCard';
import { useDashboard } from './DashboardContext';
import { DashboardGrid } from './DashboardGrid';

export const DashboardBody = () => {
  const {
    config,
    layouts,
    currentLayout,
    catalog,
    setConfig,
    isLoading,
    error,
  } = useDashboard();

  return (
    <QueryHint
      isLoading={isLoading}
      error={error}
      skeleton={<LoadingHint message="Loading dashboard..." />}
    >
      {currentLayout?.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <HourglassEmpty sx={{ fontSize: 48 }} />
          <Typography variant="h6">Your dashboard is empty</Typography>
          <Typography variant="caption">
            Use the items menu to add components to your dashboard
          </Typography>
        </Box>
      ) : (
        <DashboardGrid
          compactType={'vertical'}
          layouts={layouts}
          onLayoutChange={(_, allLayouts) => {
            if (!config) return;
            setConfig({
              ...config,
              positions: allLayouts,
            });
          }}
        >
          {currentLayout?.map((layout) => {
            if (catalog[layout.i] === undefined) return null;
            const { component: Component, card } = catalog[layout.i];
            return (
              <DashboardCard key={layout.i} {...card}>
                <Component />
              </DashboardCard>
            );
          })}
        </DashboardGrid>
      )}
    </QueryHint>
  );
};
